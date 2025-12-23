export interface CourseGradeInfo {
  courseId: string;
  credits: number;
  grade: number;
  isPassFail?: boolean;
  passed?: boolean;
}

export interface GPACalculationResult {
  gpa: number;
  qualityPoints: number;
  totalCredits: number;
  coursesEvaluated: number;
  details?: {
    passedCourses: number;
    failedCourses: number;
    passFailCourses: number;
  };
}

export class CumulativeGPACalculator {
  private static readonly STANDARD_GRADE_SCALE = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0,
  };

  static calculate(
    courses: CourseGradeInfo[],
    options?: {
      includePassFail?: boolean;
      roundingPlaces?: number;
    },
  ): GPACalculationResult {
    const roundingPlaces = options?.roundingPlaces ?? 2;
    const includePassFail = options?.includePassFail ?? false;

    if (courses.length === 0) {
      return {
        gpa: 0.0,
        qualityPoints: 0.0,
        totalCredits: 0,
        coursesEvaluated: 0,
        details: {
          passedCourses: 0,
          failedCourses: 0,
          passFailCourses: 0,
        },
      };
    }

    const gradedCourses = courses.filter(
      (c) => includePassFail || !c.isPassFail,
    );

    if (gradedCourses.length === 0) {
      return {
        gpa: 0.0,
        qualityPoints: 0.0,
        totalCredits: 0,
        coursesEvaluated: 0,
        details: {
          passedCourses: 0,
          failedCourses: 0,
          passFailCourses: courses.filter((c) => c.isPassFail).length,
        },
      };
    }

    let totalCredits = 0;
    let qualityPoints = 0;
    let passedCourses = 0;
    let failedCourses = 0;

    for (const course of gradedCourses) {
      totalCredits += course.credits;
      qualityPoints += course.grade * course.credits;

      if (course.grade >= 1.0) {
        passedCourses++;
      } else {
        failedCourses++;
      }
    }

    const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0.0;
    const passFailCourses = courses.filter((c) => c.isPassFail).length;

    return {
      gpa: parseFloat(gpa.toFixed(roundingPlaces)),
      qualityPoints: parseFloat(qualityPoints.toFixed(2)),
      totalCredits,
      coursesEvaluated: gradedCourses.length,
      details: {
        passedCourses,
        failedCourses,
        passFailCourses,
      },
    };
  }

  static calculateQualityPoints(grade: number, credits: number): number {
    return parseFloat((grade * credits).toFixed(2));
  }

  static letterToNumeric(
    letterGrade: string,
    gradeScale: Record<string, number> = this.STANDARD_GRADE_SCALE,
  ): number {
    const normalizedGrade = letterGrade.trim().toUpperCase();
    return gradeScale[normalizedGrade] ?? 0.0;
  }

  static validateGPA(
    calculatedGPA: number,
    requiredGPA: number,
    tolerance: number = 0.01,
  ): {
    meetsRequirement: boolean;
    difference: number;
  } {
    const difference = calculatedGPA - requiredGPA;
    return {
      meetsRequirement: difference >= -tolerance,
      difference: parseFloat(difference.toFixed(2)),
    };
  }

  static updateGPA(
    currentGPA: number,
    currentCredits: number,
    newCourses: CourseGradeInfo[],
  ): GPACalculationResult {
    const newResult = this.calculate(newCourses);

    const currentQualityPoints = currentGPA * currentCredits;
    const totalQualityPoints = currentQualityPoints + newResult.qualityPoints;
    const totalCredits = currentCredits + newResult.totalCredits;

    const updatedGPA =
      totalCredits > 0 ? totalQualityPoints / totalCredits : 0.0;

    return {
      gpa: parseFloat(updatedGPA.toFixed(2)),
      qualityPoints: parseFloat(totalQualityPoints.toFixed(2)),
      totalCredits,
      coursesEvaluated: newResult.coursesEvaluated,
    };
  }
}
