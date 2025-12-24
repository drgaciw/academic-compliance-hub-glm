import { prisma } from "@aah/database";
import {
  CumulativeGPACalculator,
  type GPACalculationResult,
  type CourseGradeInfo,
} from "@aah/compliance-engine";
import type {
  GPACalculationRequest,
  CourseGradeInput,
} from "../types/index.js";

export class GPAService {
  static async calculateGPA(request: GPACalculationRequest): Promise<{
    result: GPACalculationResult;
    breakdown: {
      institutional: GPACalculationResult;
      transfer?: GPACalculationResult;
      cumulative: GPACalculationResult;
    };
  }> {
    const { studentId, courses, includeTransfer, includePassFail } = request;

    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        courses: {
          where: { status: "COMPLETED" },
          include: { course: true },
        },
        transferEvaluations: {
          include: {
            courseMappings: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    let institutionalCourses: CourseGradeInfo[] = [];
    let transferCourses: CourseGradeInfo[] = [];

    if (courses && courses.length > 0) {
      institutionalCourses = courses.map((c) => ({
        courseId: c.courseId,
        credits: c.credits,
        grade:
          typeof c.grade === "string"
            ? CumulativeGPACalculator.letterToNumeric(c.grade)
            : c.grade,
        isPassFail: c.isPassFail || false,
      }));
    } else {
      institutionalCourses = student.courses.map((enrollment) => ({
        courseId: enrollment.courseId,
        credits: enrollment.course.credits,
        grade: enrollment.grade
          ? CumulativeGPACalculator.letterToNumeric(enrollment.grade)
          : 0,
        isPassFail: false,
      }));
    }

    const institutionalResult = CumulativeGPACalculator.calculate(
      institutionalCourses,
      {
        includePassFail: includePassFail || false,
      },
    );

    if (includeTransfer) {
      transferCourses = student.transferEvaluations
        .filter((te) => te.gpa !== null)
        .flatMap((te) =>
          (te.courseMappings || []).map((cm) => ({
            courseId: cm.sourceCourseCode,
            credits: cm.sourceCredits,
            grade: te.gpa || 0,
            isPassFail: false,
          })),
        )
        .filter((cm) => cm.credits > 0);

      const transferResult = CumulativeGPACalculator.calculate(
        transferCourses,
        {
          includePassFail: false,
        },
      );

      const allCourses = [...institutionalCourses, ...transferCourses];
      const cumulativeResult = CumulativeGPACalculator.calculate(allCourses, {
        includePassFail: includePassFail || false,
      });

      return {
        result: cumulativeResult,
        breakdown: {
          institutional: institutionalResult,
          transfer: transferResult,
          cumulative: cumulativeResult,
        },
      };
    }

    return {
      result: institutionalResult,
      breakdown: {
        institutional: institutionalResult,
        cumulative: institutionalResult,
      },
    };
  }

  static async predictGPA(
    studentId: string,
    projectedCourses: CourseGradeInput[],
    targetGPA: number,
  ) {
    const current = await this.calculateGPA({ studentId });

    const projectedCoursesConverted: CourseGradeInfo[] = projectedCourses.map(
      (c) => ({
        courseId: c.courseId,
        credits: c.credits,
        grade:
          typeof c.grade === "string"
            ? CumulativeGPACalculator.letterToNumeric(c.grade)
            : c.grade,
      }),
    );

    const projectedResult = CumulativeGPACalculator.updateGPA(
      current.result.gpa,
      current.result.totalCredits,
      projectedCoursesConverted,
    );

    const remainingCredits =
      120 - current.result.totalCredits - projectedResult.totalCredits;
    const prediction = CumulativeGPACalculator.validateGPA(
      projectedResult.gpa,
      targetGPA,
    );

    return {
      currentGPA: current.result.gpa,
      projectedGPA: projectedResult.gpa,
      targetGPA,
      meetsTarget: prediction.meetsRequirement,
      difference: prediction.difference,
      projectedCredits: projectedResult.totalCredits,
      remainingCredits,
    };
  }
}
