import type {
  StudentRecord,
  EligibilityResult,
  RuleConfig,
  RuleEvaluationContext,
} from "./types";
import { CreditHoursRule } from "./credit-hours.js";
import { GPARequirementsRule } from "./gpa-requirements.js";
import { ProgressTowardDegreeRule } from "./progress-toward-degree.js";
import { TransferEligibilityRule } from "./transfer-eligibility.js";
import { CoreCoursesRule } from "./core-courses.js";

type RuleEvaluator = (
  student: StudentRecord,
  ...args: unknown[]
) => EligibilityResult;

interface RuleMetadata {
  ruleId: string;
  name: string;
  bylawReference: string;
  evaluator: RuleEvaluator;
  defaultConfig: Partial<RuleConfig>;
}

const RULE_REGISTRY: Map<string, RuleMetadata> = new Map();

RULE_REGISTRY.set(CreditHoursRule.RULE_ID, {
  ruleId: CreditHoursRule.RULE_ID,
  name: CreditHoursRule.RULE_NAME,
  bylawReference: CreditHoursRule.BYLAW_14_5_1,
  evaluator: CreditHoursRule.evaluate,
  defaultConfig: {
    version: "1.0.0",
    enabled: true,
  },
});

RULE_REGISTRY.set(GPARequirementsRule.RULE_ID, {
  ruleId: GPARequirementsRule.RULE_ID,
  name: GPARequirementsRule.RULE_NAME,
  bylawReference: GPARequirementsRule.BYLAW_14_5_2,
  evaluator: (student, institutionalGPA = 2.0) =>
    GPARequirementsRule.evaluate(student, institutionalGPA as number),
  defaultConfig: {
    version: "1.0.0",
    enabled: true,
    parameters: { institutionalGPA: 2.0 },
  },
});

RULE_REGISTRY.set(ProgressTowardDegreeRule.RULE_ID, {
  ruleId: ProgressTowardDegreeRule.RULE_ID,
  name: ProgressTowardDegreeRule.RULE_NAME,
  bylawReference: ProgressTowardDegreeRule.BYLAW_14_5_3,
  evaluator: (student, totalDegreeCredits = 120) =>
    ProgressTowardDegreeRule.evaluate(student, totalDegreeCredits as number),
  defaultConfig: {
    version: "1.0.0",
    enabled: true,
    parameters: { totalDegreeCredits: 120 },
  },
});

RULE_REGISTRY.set(TransferEligibilityRule.RULE_ID, {
  ruleId: TransferEligibilityRule.RULE_ID,
  name: TransferEligibilityRule.RULE_NAME,
  bylawReference: TransferEligibilityRule.BYLAW_14_5_4,
  evaluator: TransferEligibilityRule.evaluate,
  defaultConfig: {
    version: "1.0.0",
    enabled: true,
  },
});

RULE_REGISTRY.set(CoreCoursesRule.RULE_ID, {
  ruleId: CoreCoursesRule.RULE_ID,
  name: CoreCoursesRule.RULE_NAME,
  bylawReference: CoreCoursesRule.BYLAW_14_3,
  evaluator: CoreCoursesRule.evaluate,
  defaultConfig: {
    version: "1.0.0",
    enabled: true,
  },
});

const ruleConfigCache = new Map<string, RuleConfig[]>();
const institutionConfigCache = new Map<string, Map<string, RuleConfig>>();

export class RuleConfigurationSystem {
  private static instance: RuleConfigurationSystem;

  private constructor() {}

  static getInstance(): RuleConfigurationSystem {
    if (!RuleConfigurationSystem.instance) {
      RuleConfigurationSystem.instance = new RuleConfigurationSystem();
    }
    return RuleConfigurationSystem.instance;
  }

  registerRule(ruleMetadata: RuleMetadata): void {
    RULE_REGISTRY.set(ruleMetadata.ruleId, ruleMetadata);
  }

  getRule(ruleId: string): RuleMetadata | undefined {
    return RULE_REGISTRY.get(ruleId);
  }

  getAllRules(): RuleMetadata[] {
    return Array.from(RULE_REGISTRY.values());
  }

  getAllConfigs(): Record<string, RuleConfig> {
    const configs: Record<string, RuleConfig> = {};
    for (const [ruleId, rule] of RULE_REGISTRY.entries()) {
      configs[ruleId] = {
        ruleId,
        version: rule.defaultConfig.version || "1.0.0",
        enabled: rule.defaultConfig.enabled ?? true,
        parameters: rule.defaultConfig.parameters,
      };
    }
    return configs;
  }

  getRuleConfig(ruleId: string, institutionId?: string): RuleConfig {
    const rule = RULE_REGISTRY.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    let config: RuleConfig = {
      ruleId,
      version: rule.defaultConfig.version || "1.0.0",
      enabled: rule.defaultConfig.enabled ?? true,
      parameters: rule.defaultConfig.parameters,
    };

    if (institutionId) {
      const institutionConfigs = institutionConfigCache.get(institutionId);
      if (institutionConfigs) {
        const override = institutionConfigs.get(ruleId);
        if (override) {
          config = { ...config, ...override };
        }
      }
    }

    return config;
  }

  async loadRuleConfigurations(institutionId?: string): Promise<RuleConfig[]> {
    const cacheKey = institutionId || "default";

    if (ruleConfigCache.has(cacheKey)) {
      return ruleConfigCache.get(cacheKey)!;
    }

    const configs: RuleConfig[] = [];

    for (const [ruleId, rule] of RULE_REGISTRY.entries()) {
      const config: RuleConfig = {
        ruleId,
        version: rule.defaultConfig.version || "1.0.0",
        enabled: rule.defaultConfig.enabled ?? true,
        parameters: rule.defaultConfig.parameters,
      };

      if (institutionId) {
        const institutionConfigs = institutionConfigCache.get(institutionId);
        if (institutionConfigs) {
          const override = institutionConfigs.get(ruleId);
          if (override) {
            Object.assign(config, override);
          }
        }
      }

      configs.push(config);
    }

    ruleConfigCache.set(cacheKey, configs);

    return configs;
  }

  setInstitutionOverride(
    institutionId: string,
    ruleId: string,
    override: Partial<RuleConfig>,
  ): void {
    if (!institutionConfigCache.has(institutionId)) {
      institutionConfigCache.set(institutionId, new Map());
    }

    const institutionConfigs = institutionConfigCache.get(institutionId)!;
    const existing = institutionConfigs.get(ruleId);
    institutionConfigs.set(ruleId, {
      ...(existing || { ruleId, version: "1.0.0", enabled: true }),
      ...override,
    });

    this.clearCache(institutionId);
  }

  selectRuleByVersion(ruleId: string, version: string): RuleConfig | undefined {
    const rule = RULE_REGISTRY.get(ruleId);
    if (!rule) {
      return undefined;
    }

    return {
      ruleId,
      version,
      enabled: rule.defaultConfig.enabled ?? true,
      parameters: rule.defaultConfig.parameters,
    };
  }

  clearCache(institutionId?: string): void {
    if (institutionId) {
      ruleConfigCache.delete(institutionId);
    } else {
      ruleConfigCache.clear();
    }
  }

  async evaluateRule(
    ruleId: string,
    student: StudentRecord,
    context?: RuleEvaluationContext,
    ...args: unknown[]
  ): Promise<EligibilityResult> {
    const rule = RULE_REGISTRY.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const config = this.getRuleConfig(ruleId, context?.institutionId);

    if (!config.enabled) {
      return {
        passed: true,
        ruleId,
        ruleName: rule.name,
        bylawReference: rule.bylawReference,
        message: `Rule ${ruleId} is disabled`,
        details: {
          currentValue: 0,
          requiredValue: 0,
          difference: 0,
        },
      };
    }

    const mergedArgs = [
      student,
      ...(args.length > 0 ? args : Object.values(config.parameters || {})),
    ];

    return rule.evaluator(student, ...mergedArgs.slice(1));
  }

  async evaluateAllRules(
    student: StudentRecord,
    context?: RuleEvaluationContext,
  ): Promise<EligibilityResult[]> {
    const configs = await this.loadRuleConfigurations(context?.institutionId);
    const results: EligibilityResult[] = [];

    for (const config of configs) {
      if (!config.enabled) {
        continue;
      }

      try {
        const result = await this.evaluateRule(
          config.ruleId,
          student,
          context,
          ...Object.values(config.parameters || {}),
        );
        results.push(result);
      } catch (error) {
        const rule = RULE_REGISTRY.get(config.ruleId);
        results.push({
          passed: false,
          ruleId: config.ruleId,
          ruleName: rule?.name || config.ruleId,
          bylawReference: rule?.bylawReference || "Unknown",
          message: `Error evaluating rule: ${error instanceof Error ? error.message : String(error)}`,
          details: {
            currentValue: 0,
            requiredValue: 0,
            difference: 0,
          },
        });
      }
    }

    return results;
  }

  getRulesByBylaw(bylawReference: string): RuleMetadata[] {
    return Array.from(RULE_REGISTRY.values()).filter(
      (rule) => rule.bylawReference === bylawReference,
    );
  }

  async initializeFromDatabase(institutionId?: string): Promise<void> {
    await this.loadRuleConfigurations(institutionId);
  }
}
