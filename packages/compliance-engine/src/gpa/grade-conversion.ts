export type GradeScaleType = "standard" | "plus-minus" | "percentage";

export interface GradeScaleEntry {
  letterGrade: string;
  numericValue: number;
  minPercentage: number;
  maxPercentage: number;
  description?: string;
}

export interface GradeScale {
  name: string;
  type: GradeScaleType;
  entries: GradeScaleEntry[];
  passingGrade?: number;
}

export interface PassFailConfig {
  passGrade: string;
  passCredits: boolean;
  passCountForGPA: boolean;
  failGrade: string;
  failCredits: boolean;
  failCountForGPA: boolean;
}

export class GradeConversionTable {
  private static readonly STANDARD_SCALE: GradeScale = {
    name: "Standard 4.0 Scale",
    type: "standard",
    entries: [
      {
        letterGrade: "A",
        numericValue: 4.0,
        minPercentage: 90,
        maxPercentage: 100,
      },
      {
        letterGrade: "B",
        numericValue: 3.0,
        minPercentage: 80,
        maxPercentage: 89,
      },
      {
        letterGrade: "C",
        numericValue: 2.0,
        minPercentage: 70,
        maxPercentage: 79,
      },
      {
        letterGrade: "D",
        numericValue: 1.0,
        minPercentage: 60,
        maxPercentage: 69,
      },
      {
        letterGrade: "F",
        numericValue: 0.0,
        minPercentage: 0,
        maxPercentage: 59,
      },
    ],
    passingGrade: 1.0,
  };

  private static readonly PLUS_MINUS_SCALE: GradeScale = {
    name: "Plus/Minus 4.0 Scale",
    type: "plus-minus",
    entries: [
      {
        letterGrade: "A+",
        numericValue: 4.0,
        minPercentage: 97,
        maxPercentage: 100,
      },
      {
        letterGrade: "A",
        numericValue: 4.0,
        minPercentage: 93,
        maxPercentage: 96,
      },
      {
        letterGrade: "A-",
        numericValue: 3.7,
        minPercentage: 90,
        maxPercentage: 92,
      },
      {
        letterGrade: "B+",
        numericValue: 3.3,
        minPercentage: 87,
        maxPercentage: 89,
      },
      {
        letterGrade: "B",
        numericValue: 3.0,
        minPercentage: 83,
        maxPercentage: 86,
      },
      {
        letterGrade: "B-",
        numericValue: 2.7,
        minPercentage: 80,
        maxPercentage: 82,
      },
      {
        letterGrade: "C+",
        numericValue: 2.3,
        minPercentage: 77,
        maxPercentage: 79,
      },
      {
        letterGrade: "C",
        numericValue: 2.0,
        minPercentage: 73,
        maxPercentage: 76,
      },
      {
        letterGrade: "C-",
        numericValue: 1.7,
        minPercentage: 70,
        maxPercentage: 72,
      },
      {
        letterGrade: "D+",
        numericValue: 1.3,
        minPercentage: 67,
        maxPercentage: 69,
      },
      {
        letterGrade: "D",
        numericValue: 1.0,
        minPercentage: 63,
        maxPercentage: 66,
      },
      {
        letterGrade: "D-",
        numericValue: 0.7,
        minPercentage: 60,
        maxPercentage: 62,
      },
      {
        letterGrade: "F",
        numericValue: 0.0,
        minPercentage: 0,
        maxPercentage: 59,
      },
    ],
    passingGrade: 0.7,
  };

  private static readonly PERCENTAGE_SCALE: GradeScale = {
    name: "Percentage Scale",
    type: "percentage",
    entries: [
      {
        letterGrade: "A",
        numericValue: 4.0,
        minPercentage: 90,
        maxPercentage: 100,
      },
      {
        letterGrade: "B",
        numericValue: 3.0,
        minPercentage: 80,
        maxPercentage: 89,
      },
      {
        letterGrade: "C",
        numericValue: 2.0,
        minPercentage: 70,
        maxPercentage: 79,
      },
      {
        letterGrade: "D",
        numericValue: 1.0,
        minPercentage: 60,
        maxPercentage: 69,
      },
      {
        letterGrade: "F",
        numericValue: 0.0,
        minPercentage: 0,
        maxPercentage: 59,
      },
    ],
    passingGrade: 60,
  };

  static getScale(type: GradeScaleType): GradeScale {
    switch (type) {
      case "standard":
        return this.STANDARD_SCALE;
      case "plus-minus":
        return this.PLUS_MINUS_SCALE;
      case "percentage":
        return this.PERCENTAGE_SCALE;
      default:
        return this.STANDARD_SCALE;
    }
  }

  static convertLetterToNumeric(
    letterGrade: string,
    scale: GradeScale = this.STANDARD_SCALE,
  ): number {
    const normalizedGrade = letterGrade.trim().toUpperCase();
    const entry = scale.entries.find((e) => e.letterGrade === normalizedGrade);
    return entry?.numericValue ?? 0.0;
  }

  static convertPercentageToLetter(
    percentage: number,
    scale: GradeScale = this.STANDARD_SCALE,
  ): string {
    if (percentage < 0 || percentage > 100) {
      return "F";
    }

    const entry = scale.entries.find(
      (e) => percentage >= e.minPercentage && percentage <= e.maxPercentage,
    );
    return entry?.letterGrade ?? "F";
  }

  static convertPercentageToNumeric(
    percentage: number,
    scale: GradeScale = this.STANDARD_SCALE,
  ): number {
    const letterGrade = this.convertPercentageToLetter(percentage, scale);
    return this.convertLetterToNumeric(letterGrade, scale);
  }

  static createCustomScale(
    name: string,
    type: GradeScaleType,
    entries: GradeScaleEntry[],
  ): GradeScale {
    const lastEntry = entries[entries.length - 1];
    return {
      name,
      type,
      entries,
      passingGrade: lastEntry?.numericValue ?? 1.0,
    };
  }

  static isPassingGrade(
    numericGrade: number,
    scale: GradeScale = this.STANDARD_SCALE,
  ): boolean {
    const passingGrade = scale.passingGrade ?? 1.0;
    return numericGrade >= passingGrade;
  }

  static isPassingPercentage(
    percentage: number,
    scale: GradeScale = this.STANDARD_SCALE,
  ): boolean {
    const numericGrade = this.convertPercentageToNumeric(percentage, scale);
    return this.isPassingGrade(numericGrade, scale);
  }

  static getGradeRange(
    letterGrade: string,
    scale: GradeScale = this.STANDARD_SCALE,
  ): {
    minPercentage: number;
    maxPercentage: number;
    numericValue: number;
  } | null {
    const normalizedGrade = letterGrade.trim().toUpperCase();
    const entry = scale.entries.find((e) => e.letterGrade === normalizedGrade);

    if (!entry) {
      return null;
    }

    return {
      minPercentage: entry.minPercentage,
      maxPercentage: entry.maxPercentage,
      numericValue: entry.numericValue,
    };
  }

  static getAllGrades(scale: GradeScale = this.STANDARD_SCALE): string[] {
    return scale.entries.map((e) => e.letterGrade);
  }

  static getPassingGrades(scale: GradeScale = this.STANDARD_SCALE): string[] {
    const passingGrade = scale.passingGrade ?? 1.0;
    return scale.entries
      .filter((e) => e.numericValue >= passingGrade)
      .map((e) => e.letterGrade);
  }

  static handlePassFail(
    grade: string,
    config: PassFailConfig,
  ): {
    numericValue: number;
    countedForGPA: boolean;
    countedForCredits: boolean;
    passed: boolean;
  } {
    const normalizedGrade = grade.trim().toUpperCase();

    if (normalizedGrade === config.passGrade) {
      return {
        numericValue: config.passCountForGPA ? 4.0 : 0.0,
        countedForGPA: config.passCountForGPA,
        countedForCredits: config.passCredits,
        passed: true,
      };
    } else if (normalizedGrade === config.failGrade) {
      return {
        numericValue: config.failCountForGPA ? 0.0 : 0.0,
        countedForGPA: config.failCountForGPA,
        countedForCredits: config.failCredits,
        passed: false,
      };
    }

    return {
      numericValue: 0.0,
      countedForGPA: false,
      countedForCredits: false,
      passed: false,
    };
  }

  static getDefaultPassFailConfig(): PassFailConfig {
    return {
      passGrade: "P",
      passCredits: true,
      passCountForGPA: false,
      failGrade: "F",
      failCredits: false,
      failCountForGPA: false,
    };
  }
}
