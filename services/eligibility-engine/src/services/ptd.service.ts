import { prisma } from "@aah/database";
import {
  ProgressTowardDegreeRule,
  RuleConfigurationSystem,
} from "@aah/compliance-engine";
import type {
  StudentRecord,
  ProgressTowardDegree,
} from "@aah/compliance-engine";
import type { PTDCalculationRequest } from "../types/index.js";

export class PTDService {
  static async calculateProgressTowardDegree(
    request: PTDCalculationRequest,
  ): Promise<{
    progress: ProgressTowardDegree;
    breakdown: {
      institutional: number;
      transfer: number;
      totalEarned: number;
      inProgress: number;
    };
    termProgress: Array<{
      term: string;
      year: number;
      credits: number;
    }>;
  }> {
    const { studentId, degreeProgram, includeTransferCredits } = request;

    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        user: true,
        courses: {
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

    const completedCourses = student.courses.filter(
      (c) => c.status === "COMPLETED",
    );
    const inProgressCourses = student.courses.filter(
      (c) => c.status === "IN_PROGRESS",
    );

    const institutionalCredits = completedCourses.reduce(
      (sum, c) => sum + c.course.credits,
      0,
    );
    const inProgressCredits = inProgressCourses.reduce(
      (sum, c) => sum + c.course.credits,
      0,
    );

    const transferCredits = includeTransferCredits
      ? student.transferEvaluations.reduce(
          (sum, te) => sum + te.transferableCredits,
          0,
        )
      : 0;

    const totalEarned = institutionalCredits + transferCredits;
    const totalDegreeCredits = degreeProgram?.includes("masters") ? 36 : 120;

    const studentRecord: StudentRecord = {
      studentId: student.studentId,
      name: `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(),
      gpa: student.gpa || 0,
      completedCredits: totalEarned,
      currentCredits: inProgressCredits,
      academicYear: student.year,
      academicStanding: "good",
      degreeCredits: totalDegreeCredits,
      transferCredits,
    };

    const ruleConfig = RuleConfigurationSystem.getInstance();
    const ptdResult = ProgressTowardDegreeRule.evaluate(
      studentRecord,
      totalDegreeCredits,
    );

    const progress: ProgressTowardDegree = {
      percentageComplete: ptdResult.details.currentValue as number,
      requiredPercentage: ptdResult.details.requiredValue as number,
      totalDegreeCredits: totalDegreeCredits,
      creditsEarned: Math.round(
        (ptdResult.details.currentValue as number) * totalDegreeCredits,
      ),
    };

    const termCreditsMap = new Map<string, number>();
    for (const enrollment of completedCourses) {
      const key = `${enrollment.course.semester}-${enrollment.course.year}`;
      termCreditsMap.set(
        key,
        (termCreditsMap.get(key) || 0) + enrollment.course.credits,
      );
    }

    const termProgress = Array.from(termCreditsMap.entries())
      .map(([key, credits]) => {
        const [term, year] = key.split("-");
        return { term, year: parseInt(year, 10), credits };
      })
      .sort((a, b) => a.year - b.year);

    return {
      progress,
      breakdown: {
        institutional: institutionalCredits,
        transfer: transferCredits,
        totalEarned,
        inProgress: inProgressCredits,
      },
      termProgress,
    };
  }

  static async getCourseCategoryBreakdown(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        courses: {
          where: { status: "COMPLETED" },
          include: { course: true },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const categories: Record<string, number> = {};
    const totalCredits = student.courses.reduce(
      (sum, c) => sum + c.course.credits,
      0,
    );

    for (const enrollment of student.courses) {
      const department = enrollment.course.department;
      categories[department] =
        (categories[department] || 0) + enrollment.course.credits;
    }

    return {
      totalCredits,
      categories: Object.entries(categories).map(([department, credits]) => ({
        department,
        credits,
        percentage: (credits / totalCredits) * 100,
      })),
    };
  }

  static async getRemainingRequirements(studentId: string) {
    const progress = await this.calculateProgressTowardDegree({ studentId });
    const totalRequired = progress.progress.totalDegreeCredits;
    const creditsEarned = progress.progress.creditsEarned;
    const remainingCredits = Math.max(0, totalRequired - creditsEarned);

    const termsRemaining = Math.ceil(remainingCredits / 15);
    const estimatedCompletion = new Date();
    estimatedCompletion.setMonth(
      estimatedCompletion.getMonth() + termsRemaining * 4,
    );

    return {
      creditsRemaining: remainingCredits,
      termsRemaining,
      estimatedCompletionDate: estimatedCompletion.toISOString(),
      pace: {
        creditsPerTerm: creditsEarned / (progress.termProgress.length || 1),
        onTrack: creditsEarned / (progress.termProgress.length || 1) >= 15,
      },
    };
  }
}
