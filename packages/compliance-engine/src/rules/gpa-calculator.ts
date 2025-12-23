export interface CourseGrade {
  courseId: string;
  credits: number;
  grade: number;
}

export interface GPACalculationResult {
  gpa: number;
  qualityPoints: number;
  totalCredits: number;
  coursesEvaluated: number;
}

export class GPACalculator {
  static readonly GRADE_SCALE = {
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  };

  static letterToNumeric(letterGrade: string): number {
    const grade = letterGrade.trim().toUpperCase();
    return this.GRADE_SCALE[grade as keyof typeof this.GRADE_SCALE] ?? 0.0;
  }

  static calculate(courses: CourseGrade[]): GPACalculationResult {
    if (courses.length === 0) {
      return {
        gpa: 0.0,
        qualityPoints: 0.0,
        totalCredits: 0,
        coursesEvaluated: 0,
      };
    }

    const totalCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0,
    );

    if (totalCredits === 0) {
      return {
        gpa: 0.0,
        qualityPoints: 0.0,
        totalCredits: 0,
        coursesEvaluated: 0,
      };
    }

    const qualityPoints = courses.reduce(
      (sum, course) => sum + course.grade * course.credits,
      0,
    );
    const gpa = qualityPoints / totalCredits;

    return {
      gpa: parseFloat(gpa.toFixed(3)),
      qualityPoints: parseFloat(qualityPoints.toFixed(2)),
      totalCredits,
      coursesEvaluated: courses.length,
    };
  }

  static calculateFromLetterGrades(
    letterCourses: { courseId: string; credits: number; grade: string }[],
  ): GPACalculationResult {
    const courses: CourseGrade[] = letterCourses.map((lc) => ({
      courseId: lc.courseId,
      credits: lc.credits,
      grade: this.letterToNumeric(lc.grade),
    }));

    return this.calculate(courses);
  }

  static updateGPA(
    currentGPA: number,
    currentCredits: number,
    newCourses: CourseGrade[],
  ): number {
    if (currentCredits === 0) {
      return this.calculate(newCourses).gpa;
    }

    const currentQualityPoints = currentGPA * currentCredits;
    const newResult = this.calculate(newCourses);
    const totalQualityPoints = currentQualityPoints + newResult.qualityPoints;
    const totalCredits = currentCredits + newResult.totalCredits;

    return parseFloat((totalQualityPoints / totalCredits).toFixed(3));
  }

  static calculateWithWeights(
    courses: CourseGrade[],
    weights: Record<string, number>,
  ): GPACalculationResult {
    const weightedCourses = courses.map((course) => ({
      ...course,
      grade: course.grade * (weights[course.courseId] || 1.0),
    }));

    return this.calculate(weightedCourses);
  }

  static predictGPA(
    currentGPA: number,
    currentCredits: number,
    targetGPA: number,
    remainingCredits: number,
  ): {
    neededGPA: number;
    achievable: boolean;
  } {
    const totalQualityPointsNeeded =
      targetGPA * (currentCredits + remainingCredits);
    const currentQualityPoints = currentGPA * currentCredits;
    const neededQualityPoints = totalQualityPointsNeeded - currentQualityPoints;
    const neededGPA = neededQualityPoints / remainingCredits;

    return {
      neededGPA: parseFloat(neededGPA.toFixed(3)),
      achievable: neededGPA <= 4.0,
    };
  }
}
