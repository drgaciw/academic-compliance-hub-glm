import type { CourseGradeInfo } from "./cumulative-gpa";

export interface CourseWithSubject extends CourseGradeInfo {
  subjectCode: string;
  subjectName?: string;
  isCore?: boolean;
}

export interface SubjectGPACalculationResult {
  subjectCode: string;
  subjectName: string | undefined;
  gpa: number;
  qualityPoints: number;
  totalCredits: number;
  coursesEvaluated: number;
  meetsMinimum: boolean;
  minimumRequired: number | undefined;
}

export interface SubjectGPAValidationResult {
  subjectCode: string;
  subjectName: string | undefined;
  currentGPA: number;
  minimumRequired: number;
  passes: boolean;
  difference: number;
  remediationNeeded: boolean;
}

export class SubjectAreaGPACalculator {
  static calculateSubjectGPA(
    courses: CourseWithSubject[],
    subjectCode: string,
    options?: {
      includeCore?: boolean;
      includeElectives?: boolean;
    },
  ): SubjectGPACalculationResult {
    const includeCore = options?.includeCore ?? true;
    const includeElectives = options?.includeElectives ?? true;

    const filteredCourses = courses.filter((course) => {
      if (course.subjectCode !== subjectCode) return false;

      if (!includeCore && course.isCore) return false;
      if (!includeElectives && !course.isCore) return false;

      return true;
    });

    const qualityPoints = filteredCourses.reduce(
      (sum, course) => sum + course.grade * course.credits,
      0,
    );
    const totalCredits = filteredCourses.reduce(
      (sum, course) => sum + course.credits,
      0,
    );

    const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0.0;
    const subjectName = filteredCourses[0]?.subjectName;

    return {
      subjectCode,
      subjectName,
      gpa: parseFloat(gpa.toFixed(2)),
      qualityPoints: parseFloat(qualityPoints.toFixed(2)),
      totalCredits,
      coursesEvaluated: filteredCourses.length,
      meetsMinimum: false,
      minimumRequired: undefined,
    };
  }

  static calculateAllSubjects(
    courses: CourseWithSubject[],
    minimumRequirements?: Record<string, number>,
  ): SubjectGPACalculationResult[] {
    const subjectGroups = new Map<string, CourseWithSubject[]>();

    for (const course of courses) {
      if (!subjectGroups.has(course.subjectCode)) {
        subjectGroups.set(course.subjectCode, []);
      }
      subjectGroups.get(course.subjectCode)!.push(course);
    }

    const results: SubjectGPACalculationResult[] = [];

    for (const [subjectCode, subjectCourses] of subjectGroups) {
      const result = this.calculateSubjectGPA(courses, subjectCode);
      const minimumRequired = minimumRequirements?.[subjectCode];

      if (minimumRequired !== undefined) {
        result.minimumRequired = minimumRequired;
        result.meetsMinimum = result.gpa >= minimumRequired;
      }

      results.push(result);
    }

    return results.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
  }

  static validateSubjectGPA(
    courses: CourseWithSubject[],
    subjectCode: string,
    minimumRequired: number,
  ): SubjectGPAValidationResult {
    const result = this.calculateSubjectGPA(courses, subjectCode);
    const difference = result.gpa - minimumRequired;

    return {
      subjectCode,
      subjectName: result.subjectName,
      currentGPA: result.gpa,
      minimumRequired,
      passes: result.gpa >= minimumRequired,
      difference: parseFloat(difference.toFixed(2)),
      remediationNeeded: result.gpa < minimumRequired,
    };
  }

  static validateAllSubjects(
    courses: CourseWithSubject[],
    minimumRequirements: Record<string, number>,
  ): SubjectGPAValidationResult[] {
    const results: SubjectGPAValidationResult[] = [];

    for (const [subjectCode, minimumRequired] of Object.entries(
      minimumRequirements,
    )) {
      const validation = this.validateSubjectGPA(
        courses,
        subjectCode,
        minimumRequired,
      );
      results.push(validation);
    }

    return results;
  }

  static filterCoursesBySubject(
    courses: CourseWithSubject[],
    subjectCodes: string[],
  ): CourseWithSubject[] {
    return courses.filter((course) =>
      subjectCodes.includes(course.subjectCode),
    );
  }

  static getSubjectCredits(
    courses: CourseWithSubject[],
    subjectCode: string,
  ): {
    totalCredits: number;
    earnedCredits: number;
    coreCredits: number;
    electiveCredits: number;
  } {
    const subjectCourses = courses.filter(
      (course) => course.subjectCode === subjectCode,
    );

    const totalCredits = subjectCourses.reduce(
      (sum, course) => sum + course.credits,
      0,
    );
    const earnedCredits = subjectCourses
      .filter((course) => course.grade >= 1.0)
      .reduce((sum, course) => sum + course.credits, 0);
    const coreCredits = subjectCourses
      .filter((course) => course.isCore)
      .reduce((sum, course) => sum + course.credits, 0);
    const electiveCredits = totalCredits - coreCredits;

    return {
      totalCredits,
      earnedCredits,
      coreCredits,
      electiveCredits,
    };
  }
}
