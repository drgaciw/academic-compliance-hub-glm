# Code Review: PR #39 — Implement currency conversion logic using CurrencyService

**PR:** https://github.com/drgaciw/deal-desk-service/pull/39
**Author:** drgaciw
**Status:** Merged
**Reviewed by:** Claude (automated review)

---

## Summary

This PR introduces a `CurrencyService` abstraction to normalize deal values during mapping. It refactors `DealMapperHelper` from static utility methods into a Spring `@Component` with dependency injection, creates a `CurrencyService` interface with a `CurrencyServiceImpl` backed by hardcoded exchange rates, and updates `DealMapper` to use MapStruct source-based delegation. Tests are added for both the service and helper.

Overall the structural direction is good — moving from static methods to injectable components improves testability and follows Spring conventions. However, there are several issues ranging from correctness risks to thread-safety concerns that should be addressed before this code sees production traffic.

---

## Critical Issues

### 1. Mutable static `HashMap` is not thread-safe
**File:** `CurrencyServiceImpl.java`
**Severity:** High

```java
private static final Map<String, BigDecimal> EXCHANGE_RATES = new HashMap<>();

static {
    EXCHANGE_RATES.put("USD", BigDecimal.ONE);
    EXCHANGE_RATES.put("EUR", new BigDecimal("1.10"));
    // ...
}
```

`EXCHANGE_RATES` is a mutable `HashMap` exposed as a static field. While the static initializer block runs before any thread can access the class, the map itself remains mutable — any code with access could call `EXCHANGE_RATES.put(...)` or `EXCHANGE_RATES.clear()` and introduce data races. This is a classic thread-safety anti-pattern for effectively-constant data.

**Recommended fix — use `Map.of()` (Java 9+):**
```java
private static final Map<String, BigDecimal> EXCHANGE_RATES = Map.of(
    "USD", BigDecimal.ONE,
    "EUR", new BigDecimal("1.10"),
    "GBP", new BigDecimal("1.27"),
    "JPY", new BigDecimal("0.0068"),
    "CAD", new BigDecimal("0.74"),
    "AUD", new BigDecimal("0.66")
);
```

Or if Java 8 compatibility is required, wrap with `Collections.unmodifiableMap()`.

---

### 2. Silent fallback to `BigDecimal.ONE` for unknown currencies masks errors
**File:** `CurrencyServiceImpl.java`
**Severity:** High

```java
return EXCHANGE_RATES.getOrDefault(currencyCode.toUpperCase(), BigDecimal.ONE);
```

When an unknown or misspelled currency code is passed (e.g., `"UDS"` instead of `"USD"`, or `"CHF"` which isn't in the map), the method silently returns `BigDecimal.ONE`. This means:
- A deal valued at 1,000,000 JPY would be stored as 1,000,000 USD instead of ~6,800 USD
- Typos in currency codes produce silently incorrect deal valuations
- There is no logging, metric, or audit trail when this fallback fires

**Recommended fix:** Throw an `IllegalArgumentException` (or a custom `UnsupportedCurrencyException`) for currency codes not found in the map. At minimum, log a warning so the issue is observable:

```java
BigDecimal rate = EXCHANGE_RATES.get(currencyCode.toUpperCase());
if (rate == null) {
    log.warn("Unsupported currency code: '{}', defaulting to 1:1 rate", currencyCode);
    return BigDecimal.ONE;
}
return rate;
```

---

### 3. `resolveValue()` has no null-check on the `dto` parameter
**File:** `DealMapperHelper.java`
**Severity:** High

```java
public BigDecimal resolveValue(DealRequestDTO dto) {
    return convertCurrency(dto.getValue(), dto.getCurrency());
}
```

If `dto` is `null`, this throws a `NullPointerException` at `dto.getValue()`. Since this method is called by MapStruct via `@Mapping(target = "value", source = ".")`, a null source object could reach it depending on mapping configuration.

**Recommended fix:**
```java
public BigDecimal resolveValue(DealRequestDTO dto) {
    if (dto == null) {
        return BigDecimal.ZERO;
    }
    return convertCurrency(dto.getValue(), dto.getCurrency());
}
```

---

### 4. Build artifacts committed to version control
**Files:** `target/maven-status/maven-compiler-plugin/.../createdFiles.lst`, `target/maven-status/maven-compiler-plugin/.../inputFiles.lst`
**Severity:** High

The `target/` directory contains Maven build output and should never be committed. These files change on every build and will cause unnecessary merge conflicts.

**Recommended fix:**
- Add `target/` to `.gitignore` if not already present
- Remove the committed files: `git rm -r --cached target/`

---

## Medium Issues

### 5. Returning `BigDecimal.ZERO` for null amounts silently creates zero-valued deals
**File:** `DealMapperHelper.java`
**Severity:** Medium

```java
public BigDecimal convertCurrency(BigDecimal amount, String currencyCode) {
    if (amount == null) {
        return BigDecimal.ZERO;
    }
    // ...
}
```

When `amount` is null, the method returns `BigDecimal.ZERO`. This means a deal with a missing value field gets silently created with a $0 valuation rather than flagging the missing data. Depending on business rules, this could either be correct or could mask data quality issues in upstream systems.

**Recommendation:** Confirm whether this is the desired business behavior. If null amounts should be rejected, throw an exception or return `null` and let the caller/mapper handle it. At minimum, add a code comment documenting this is intentional.

---

### 6. Redundant null/empty currency checks between helper and service
**File:** `DealMapperHelper.java` + `CurrencyServiceImpl.java`
**Severity:** Low-Medium

`DealMapperHelper.convertCurrency` short-circuits on null/empty currency by returning the raw amount:
```java
if (currencyCode == null || currencyCode.isEmpty()) {
    return amount; // Default to USD
}
```

Meanwhile, `CurrencyServiceImpl.getConversionRate` also handles null/empty by returning `BigDecimal.ONE`:
```java
if (currencyCode == null || currencyCode.trim().isEmpty()) {
    return BigDecimal.ONE;
}
```

The end result is functionally equivalent (`amount * 1 == amount`), but having the check in both places creates confusion about which layer owns this responsibility. Also note the subtle difference: the helper checks `isEmpty()` while the service checks `trim().isEmpty()` — so a currency code of `" "` (whitespace) would pass through the helper into the service but be caught there.

**Recommendation:** Remove the null/empty check from the helper and let the service own all currency validation. If the helper's comment "Default to USD" is meaningful business logic, document it in the service instead.

---

### 7. Hardcoded exchange rates with no refresh mechanism
**File:** `CurrencyServiceImpl.java`
**Severity:** Medium

The implementation uses hardcoded exchange rates with no mechanism for updates. While the PR description acknowledges these are "placeholder" rates, there's no TODO, no configuration path, and no interface contract that suggests rates will be dynamic.

**Recommendation:** Add a clear TODO or `@Deprecated` annotation indicating this implementation is a placeholder. Consider:
- Loading rates from application properties / external config
- Adding a `refreshRates()` method to the interface
- Documenting the expected production implementation (external API, database cache, etc.)

---

## Minor Issues / Style

### 8. `@Autowired` on single constructor is redundant
**File:** `DealMapperHelper.java`
**Severity:** Low

```java
@Autowired
public DealMapperHelper(CurrencyService currencyService) {
```

Since Spring 4.3, `@Autowired` is implicit on single-constructor beans. Removing it reduces noise. If the codebase uses Lombok, `@RequiredArgsConstructor` with a `final` field is more idiomatic.

---

### 9. Incomplete test coverage for `determineNextAction()`
**File:** `DealMapperHelperTest.java`
**Severity:** Low-Medium

Only `DRAFT` and `null` are tested:
```java
void determineNextAction_Draft_ReturnsSubmit() { ... }
void determineNextAction_Null_ReturnsNoAction() { ... }
```

The `DealStatus` enum likely has additional values (e.g., `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `CLOSED`). All branches of the switch/if-chain in `determineNextAction` should have corresponding test cases. A parameterized test (`@ParameterizedTest` + `@EnumSource`) would be ideal here.

---

### 10. Missing edge-case tests
**File:** `DealMapperHelperTest.java`
**Severity:** Low

Missing test scenarios:
- `convertCurrency` with a null currency but valid amount (verifies the default-to-USD path)
- `convertCurrency` with an empty string currency
- `resolveValue` with a null `DealRequestDTO` (exposes the NPE from issue #3)
- `CurrencyServiceImplTest` should verify case-insensitivity works (e.g., `"eur"`, `"Eur"`)

---

### 11. MapStruct binding lacks `qualifiedByName` for explicit method resolution
**File:** `DealMapper.java`
**Severity:** Low

```java
@Mapping(target = "value", source = ".")
@Mapping(target = "daysInCurrentStatus", source = ".")
@Mapping(target = "nextAction", source = "status")
```

These rely on MapStruct auto-discovering the correct helper methods by parameter/return type matching. If additional methods with compatible signatures are added to `DealMapperHelper` later, MapStruct may fail to resolve the correct method or pick the wrong one. Using `qualifiedByName` with `@Named` annotations on the helper methods makes the binding explicit and resilient to future changes.

---

### 12. `CurrencyServiceImplTest` uses `@ExtendWith(MockitoExtension.class)` unnecessarily
**File:** `CurrencyServiceImplTest.java`
**Severity:** Trivial

The test class doesn't use any Mockito features (no `@Mock`, no `@InjectMocks`). The `@ExtendWith(MockitoExtension.class)` annotation is unnecessary overhead and may confuse readers into thinking mocks are in play.

---

## Verdict

**Request Changes.** The PR has a sound architectural direction but introduces several issues that could cause incorrect deal valuations in production (silent currency fallbacks, null-safety gaps, mutable shared state). The critical issues (#1–#4) should be addressed. The medium issues (#5–#7) should be discussed and resolved based on business requirements. The minor issues can be addressed as follow-ups.

---

## Additional Findings (Repository-Level Security Audit)

During the review, a broader security audit of the repository uncovered issues beyond the PR itself:

### 13. Leaked API key in `.env.example` (FIXED)
**Severity:** Critical

A real `TESTSPRITE_API_KEY` was committed in plaintext to `.env.example`. This has been redacted to `sk-xxx`, but **the original key remains in git history**. The key should be rotated immediately regardless of whether this repository has been shared.

### 14. Environment files with credentials tracked by git (FIXED)
**Severity:** Critical

`.env.development`, `.env.staging`, and `.env.production` were being tracked by git. These have been:
- Added to `.gitignore`
- Removed from the git index via `git rm --cached`

They contain placeholder-style credentials (e.g., `staging-user:staging-pass@staging-db.example.com`) but should never be committed as they set the pattern for developers to fill in real credentials locally.

### 15. CSP nonce module (`packages/auth/src/nonce.ts`) is dead code
**Severity:** Low

The nonce module exports `generateNonce()`, `validateNonce()`, `getCSPHeader()`, and `clearNonceCache()`, but **none of these functions are used anywhere in the codebase**. The actual middleware in all three apps (`apps/admin/middleware.ts`, `apps/student/middleware.ts`, `apps/main/middleware.ts`) generates nonces directly via `crypto.randomUUID()` and builds CSP headers inline. Consider either integrating the module or removing it to avoid confusion.

### 16. `secret-audit-report.json` was excluded from `.gitignore` (FIXED)
**Severity:** Low

The secret audit report output file has been added to `.gitignore` to prevent vulnerability details from being committed.
