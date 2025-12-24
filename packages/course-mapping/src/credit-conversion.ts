export interface CreditConversionResult {
  originalCredits: number;
  originalSystem: CreditSystem;
  targetCredits: number;
  targetSystem: CreditSystem;
  conversionFactor: number;
  rounding: RoundingMethod;
  notes?: string;
}

export interface CreditConversionRule {
  sourceSystem: CreditSystem;
  targetSystem: CreditSystem;
  conversionFactor: number;
  roundingMethod: RoundingMethod;
  description: string;
}

export enum CreditSystem {
  SEMESTER = "SEMESTER",
  QUARTER = "QUARTER",
  INTERNATIONAL = "INTERNATIONAL",
  CLOCK_HOURS = "CLOCK_HOURS",
  CONTACT_HOURS = "CONTACT_HOURS",
  EUROPEAN_CREDIT = "EUROPEAN_CREDIT",
}

export enum RoundingMethod {
  ROUND = "ROUND",
  CEIL = "CEIL",
  FLOOR = "FLOOR",
  NONE = "NONE",
}

const SEMESTER_TO_QUARTER_FACTOR = 1.5;
const QUARTER_TO_SEMESTER_FACTOR = 2 / 3;
const ECTS_TO_SEMESTER_FACTOR = 0.6;
const CLOCK_HOURS_TO_SEMESTER_FACTOR = 1 / 45;
const CONTACT_HOURS_TO_SEMESTER_FACTOR = 1 / 50;

const CONVERSION_RULES: CreditConversionRule[] = [
  {
    sourceSystem: CreditSystem.SEMESTER,
    targetSystem: CreditSystem.QUARTER,
    conversionFactor: SEMESTER_TO_QUARTER_FACTOR,
    roundingMethod: RoundingMethod.ROUND,
    description:
      "Semester credits converted to quarter credits (1 semester hour = 1.5 quarter hours)",
  },
  {
    sourceSystem: CreditSystem.QUARTER,
    targetSystem: CreditSystem.SEMESTER,
    conversionFactor: QUARTER_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.ROUND,
    description:
      "Quarter credits converted to semester credits (1 quarter hour = 0.667 semester hours)",
  },
  {
    sourceSystem: CreditSystem.EUROPEAN_CREDIT,
    targetSystem: CreditSystem.SEMESTER,
    conversionFactor: ECTS_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.CEIL,
    description:
      "ECTS credits converted to semester credits (1 ECTS = 0.6 semester hours)",
  },
  {
    sourceSystem: CreditSystem.SEMESTER,
    targetSystem: CreditSystem.EUROPEAN_CREDIT,
    conversionFactor: 1 / ECTS_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.CEIL,
    description:
      "Semester credits converted to ECTS credits (1 semester hour = 1.667 ECTS)",
  },
  {
    sourceSystem: CreditSystem.CLOCK_HOURS,
    targetSystem: CreditSystem.SEMESTER,
    conversionFactor: CLOCK_HOURS_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.CEIL,
    description:
      "Clock hours converted to semester credits (45 clock hours = 1 semester credit)",
  },
  {
    sourceSystem: CreditSystem.SEMESTER,
    targetSystem: CreditSystem.CLOCK_HOURS,
    conversionFactor: 1 / CLOCK_HOURS_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.NONE,
    description:
      "Semester credits converted to clock hours (1 semester credit = 45 clock hours)",
  },
  {
    sourceSystem: CreditSystem.CONTACT_HOURS,
    targetSystem: CreditSystem.SEMESTER,
    conversionFactor: CONTACT_HOURS_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.CEIL,
    description:
      "Contact hours converted to semester credits (50 contact hours = 1 semester credit)",
  },
  {
    sourceSystem: CreditSystem.SEMESTER,
    targetSystem: CreditSystem.CONTACT_HOURS,
    conversionFactor: 1 / CONTACT_HOURS_TO_SEMESTER_FACTOR,
    roundingMethod: RoundingMethod.NONE,
    description:
      "Semester credits converted to contact hours (1 semester credit = 50 contact hours)",
  },
];

export function convertCredits(
  credits: number,
  sourceSystem: CreditSystem,
  targetSystem: CreditSystem,
  customRounding?: RoundingMethod,
): CreditConversionResult {
  if (credits < 0) {
    throw new Error("Credits cannot be negative");
  }

  if (sourceSystem === targetSystem) {
    return {
      originalCredits: credits,
      originalSystem: sourceSystem,
      targetCredits: credits,
      targetSystem,
      conversionFactor: 1,
      rounding: RoundingMethod.NONE,
      notes: "Source and target systems are the same",
    };
  }

  const rule = findConversionRule(sourceSystem, targetSystem);

  if (!rule) {
    throw new Error(
      `No conversion rule found from ${sourceSystem} to ${targetSystem}`,
    );
  }

  const rawResult = credits * rule.conversionFactor;
  const roundingMethod = customRounding ?? rule.roundingMethod;
  const targetCredits = applyRounding(rawResult, roundingMethod);

  return {
    originalCredits: credits,
    originalSystem: sourceSystem,
    targetCredits,
    targetSystem,
    conversionFactor: rule.conversionFactor,
    rounding: roundingMethod,
    notes: rule.description,
  };
}

export function batchConvertCredits(
  credits: number[],
  sourceSystem: CreditSystem,
  targetSystem: CreditSystem,
  customRounding?: RoundingMethod,
): CreditConversionResult[] {
  return credits.map((credit) =>
    convertCredits(credit, sourceSystem, targetSystem, customRounding),
  );
}

export function convertSemesterToQuarter(
  semesterCredits: number,
  rounding: RoundingMethod = RoundingMethod.ROUND,
): CreditConversionResult {
  return convertCredits(
    semesterCredits,
    CreditSystem.SEMESTER,
    CreditSystem.QUARTER,
    rounding,
  );
}

export function convertQuarterToSemester(
  quarterCredits: number,
  rounding: RoundingMethod = RoundingMethod.ROUND,
): CreditConversionResult {
  return convertCredits(
    quarterCredits,
    CreditSystem.QUARTER,
    CreditSystem.SEMESTER,
    rounding,
  );
}

export function convertECTSToSemester(
  ectsCredits: number,
  rounding: RoundingMethod = RoundingMethod.CEIL,
): CreditConversionResult {
  return convertCredits(
    ectsCredits,
    CreditSystem.EUROPEAN_CREDIT,
    CreditSystem.SEMESTER,
    rounding,
  );
}

export function normalizeInternationalCredits(
  credits: number,
  sourceSystem: CreditSystem,
  targetSystem: CreditSystem = CreditSystem.SEMESTER,
  rounding: RoundingMethod = RoundingMethod.CEIL,
): CreditConversionResult {
  return convertCredits(credits, sourceSystem, targetSystem, rounding);
}

export function applyInstitutionalRounding(
  credits: number,
  institutionId: string,
): number {
  const institutionalRules: Record<string, RoundingMethod> = {
    default: RoundingMethod.ROUND,
    inst_001: RoundingMethod.CEIL,
    inst_002: RoundingMethod.FLOOR,
  };

  const roundingMethod =
    institutionalRules[institutionId] || institutionalRules.default;

  return applyRounding(credits, roundingMethod);
}

export function applyRounding(
  value: number,
  method: RoundingMethod,
  precision: number = 2,
): number {
  const multiplier = Math.pow(10, precision);
  const scaledValue = value * multiplier;

  switch (method) {
    case RoundingMethod.ROUND:
      return Math.round(scaledValue) / multiplier;
    case RoundingMethod.CEIL:
      return Math.ceil(scaledValue) / multiplier;
    case RoundingMethod.FLOOR:
      return Math.floor(scaledValue) / multiplier;
    case RoundingMethod.NONE:
      return value;
    default:
      return Math.round(scaledValue) / multiplier;
  }
}

export function findConversionRule(
  sourceSystem: CreditSystem,
  targetSystem: CreditSystem,
): CreditConversionRule | undefined {
  return CONVERSION_RULES.find(
    (rule) =>
      rule.sourceSystem === sourceSystem && rule.targetSystem === targetSystem,
  );
}

export function getAllConversionRules(): CreditConversionRule[] {
  return [...CONVERSION_RULES];
}

export function getCreditSystemDescription(system: CreditSystem): string {
  const descriptions: Record<CreditSystem, string> = {
    [CreditSystem.SEMESTER]:
      "Standard US semester credit system (typically 15 weeks, 45 contact hours per credit)",
    [CreditSystem.QUARTER]:
      "US quarter credit system (typically 10-11 weeks, 30 contact hours per credit)",
    [CreditSystem.EUROPEAN_CREDIT]:
      "European Credit Transfer and Accumulation System (ECTS)",
    [CreditSystem.CLOCK_HOURS]:
      "Clock hours measure actual time spent in instruction (lab, clinical, etc.)",
    [CreditSystem.CONTACT_HOURS]:
      "Contact hours measure scheduled instructional time",
    [CreditSystem.INTERNATIONAL]:
      "Generic international credit system (requires specification)",
  };

  return descriptions[system];
}

export function validateCreditValue(
  credits: number,
  system: CreditSystem,
): { valid: boolean; reason?: string } {
  if (credits < 0) {
    return { valid: false, reason: "Credits cannot be negative" };
  }

  if (credits === 0) {
    return { valid: false, reason: "Credits cannot be zero" };
  }

  if (!isFinite(credits)) {
    return { valid: false, reason: "Credits must be a finite number" };
  }

  const maxCredits = 30;
  if (credits > maxCredits) {
    return {
      valid: false,
      reason: `Credits exceed maximum reasonable value (${maxCredits})`,
    };
  }

  return { valid: true };
}

export function getConversionDocumentation(): string {
  let doc = "CREDIT CONVERSION DOCUMENTATION\n";
  doc += "==============================\n\n";

  doc += "OVERVIEW:\n";
  doc +=
    "This module provides credit conversion between different academic credit systems.\n";
  doc +=
    "All conversions follow standard institutional practices and NCAA guidelines.\n\n";

  doc += "SUPPORTED SYSTEMS:\n\n";

  Object.values(CreditSystem).forEach((system) => {
    doc += `${system}:\n`;
    doc += `  ${getCreditSystemDescription(system)}\n\n`;
  });

  doc += "CONVERSION RULES:\n\n";

  CONVERSION_RULES.forEach((rule) => {
    doc += `${rule.sourceSystem} → ${rule.targetSystem}:\n`;
    doc += `  Factor: ${rule.conversionFactor}\n`;
    doc += `  Rounding: ${rule.roundingMethod}\n`;
    doc += `  Description: ${rule.description}\n\n`;
  });

  doc += "ROUNDING METHODS:\n";
  doc += "- ROUND: Standard rounding to nearest value\n";
  doc += "- CEIL: Always round up (conservative for credit transfer)\n";
  doc += "- FLOOR: Always round down\n";
  doc += "- NONE: No rounding applied\n\n";

  return doc;
}
