import { PrismaClient } from "@prisma/client";

const Role = {
  STUDENT: "STUDENT" as const,
  ADVISOR: "ADVISOR" as const,
  ADMIN: "ADMIN" as const,
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER" as const,
};

const EnrollmentStatus = {
  IN_PROGRESS: "IN_PROGRESS" as const,
  COMPLETED: "COMPLETED" as const,
  DROPPED: "DROPPED" as const,
  WITHDRAWN: "WITHDRAWN" as const,
};

const SessionStatus = {
  SCHEDULED: "SCHEDULED" as const,
  COMPLETED: "COMPLETED" as const,
  CANCELLED: "CANCELLED" as const,
};

const ComplianceStatus = {
  PENDING: "PENDING" as const,
  COMPLETED: "COMPLETED" as const,
  FAILED: "FAILED" as const,
  EXEMPTED: "EXEMPTED" as const,
};

const prisma = new PrismaClient();

describe("StudentProfile Model", () => {
  let testUserId: string;
  let testStudentProfileId: string;
  let testCourseId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "test_student_user",
        email: "student@test.com",
        role: Role.STUDENT,
      },
    });
    testUserId = user.id;

    const course = await prisma.course.create({
      data: {
        code: "TEST101",
        name: "Test Course",
        credits: 3,
        department: "TEST",
        semester: "FALL",
        year: 2024,
      },
    });
    testCourseId = course.id;
  });

  afterAll(async () => {
    await prisma.studentProfile.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.deleteMany({
      where: { clerkId: { startsWith: "test_" } },
    });
    await prisma.course.deleteMany({
      where: { code: { startsWith: "TEST" } },
    });
    await prisma.$disconnect();
  });

  describe("Model Creation Tests", () => {
    test("should create a student profile with required fields", async () => {
      const studentProfile = await prisma.studentProfile.create({
        data: {
          userId: testUserId,
          studentId: "STU001",
          sport: "Basketball",
          year: 1,
        },
      });

      expect(studentProfile).toBeDefined();
      expect(studentProfile.id).toBeDefined();
      expect(studentProfile.studentId).toBe("STU001");
      expect(studentProfile.sport).toBe("Basketball");
      expect(studentProfile.year).toBe(1);
      expect(studentProfile.eligibility).toBe(true);
      expect(studentProfile.credits).toBe(0);
      testStudentProfileId = studentProfile.id;
    });

    test("should create a student profile with optional fields", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_student_optional",
          email: "student2@test.com",
          role: Role.STUDENT,
        },
      });

      const studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU002",
          sport: "Football",
          year: 2,
          gpa: 3.5,
          credits: 30,
          eligibility: true,
        },
      });

      expect(studentProfile.gpa).toBe(3.5);
      expect(studentProfile.credits).toBe(30);
    });

    test("should have auto-generated timestamps", async () => {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: testStudentProfileId },
      });

      expect(profile?.createdAt).toBeInstanceOf(Date);
      expect(profile?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Field Validation Tests", () => {
    test("should enforce unique constraint on studentId", async () => {
      await expect(
        prisma.studentProfile.create({
          data: {
            userId: testUserId,
            studentId: "STU001",
            sport: "Baseball",
            year: 1,
          },
        }),
      ).rejects.toThrow();
    });

    test("should enforce unique constraint on userId", async () => {
      await expect(
        prisma.studentProfile.create({
          data: {
            userId: testUserId,
            studentId: "STU003",
            sport: "Soccer",
            year: 1,
          },
        }),
      ).rejects.toThrow();
    });

    test("should default credits to 0", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_student_defaults",
          email: "student3@test.com",
          role: Role.STUDENT,
        },
      });

      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU004",
          sport: "Tennis",
          year: 1,
        },
      });

      expect(profile.credits).toBe(0);
    });

    test("should default eligibility to true", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_student_elig",
          email: "student4@test.com",
          role: Role.STUDENT,
        },
      });

      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU005",
          sport: "Golf",
          year: 1,
        },
      });

      expect(profile.eligibility).toBe(true);
    });
  });

  describe("Relation Tests", () => {
    test("should be related to User", async () => {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: testStudentProfileId },
        include: { user: true },
      });

      expect(profile?.user).toBeDefined();
      expect(profile?.user.email).toBe("student@test.com");
    });

    test("should create course enrollment", async () => {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentProfileId,
          courseId: testCourseId,
          status: EnrollmentStatus.IN_PROGRESS,
        },
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.studentId).toBe(testStudentProfileId);
      expect(enrollment.courseId).toBe(testCourseId);
    });

    test("should find enrollments through relation", async () => {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: testStudentProfileId },
        include: { courses: true },
      });

      expect(profile?.courses).toBeDefined();
      expect(profile?.courses.length).toBeGreaterThan(0);
    });

    test("should create tutoring session", async () => {
      const session = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentProfileId,
          subject: "Math",
          date: new Date("2024-01-15T10:00:00Z"),
          duration: 60,
          status: SessionStatus.SCHEDULED,
        },
      });

      expect(session).toBeDefined();
      expect(session.studentId).toBe(testStudentProfileId);
    });

    test("should create compliance record", async () => {
      const record = await prisma.complianceRecord.create({
        data: {
          studentId: testStudentProfileId,
          category: "Academic",
          requirement: "Maintain 2.0 GPA",
          status: ComplianceStatus.PENDING,
          dueDate: new Date("2024-12-31"),
        },
      });

      expect(record).toBeDefined();
      expect(record.studentId).toBe(testStudentProfileId);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should read a student profile by ID", async () => {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: testStudentProfileId },
      });

      expect(profile).toBeDefined();
      expect(profile?.studentId).toBe("STU001");
    });

    test("should read a student profile by studentId", async () => {
      const profile = await prisma.studentProfile.findUnique({
        where: { studentId: "STU001" },
      });

      expect(profile).toBeDefined();
      expect(profile?.id).toBe(testStudentProfileId);
    });

    test("should update a student profile", async () => {
      const updated = await prisma.studentProfile.update({
        where: { id: testStudentProfileId },
        data: {
          gpa: 3.8,
          credits: 45,
          eligibility: true,
        },
      });

      expect(updated.gpa).toBe(3.8);
      expect(updated.credits).toBe(45);
    });

    test("should delete a student profile", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_delete_student",
          email: "deletestudent@test.com",
          role: Role.STUDENT,
        },
      });

      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU_DELETE",
          sport: "Swimming",
          year: 1,
        },
      });

      const deleted = await prisma.studentProfile.delete({
        where: { id: profile.id },
      });

      expect(deleted.id).toBe(profile.id);

      const found = await prisma.studentProfile.findUnique({
        where: { id: profile.id },
      });
      expect(found).toBeNull();
    });

    test("should list all student profiles", async () => {
      const profiles = await prisma.studentProfile.findMany({
        where: {
          studentId: { startsWith: "STU" },
        },
      });

      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Case Tests", () => {
    test("should handle optional fields as null", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_student_nulls",
          email: "nulls@test.com",
          role: Role.STUDENT,
        },
      });

      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU_NULL",
          sport: "Track",
          year: 1,
        },
      });

      expect(profile.gpa).toBeNull();
    });

    test("should update updatedAt timestamp on update", async () => {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: testStudentProfileId },
      });

      const originalUpdatedAt = profile?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.studentProfile.update({
        where: { id: testStudentProfileId },
        data: { gpa: 3.9 },
      });

      const updated = await prisma.studentProfile.findUnique({
        where: { id: testStudentProfileId },
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
    });

    test("should handle cascade delete from user", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_cascade_user",
          email: "cascade@test.com",
          role: Role.STUDENT,
        },
      });

      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU_CASCADE",
          sport: "Volleyball",
          year: 1,
        },
      });

      const profileId = profile.id;

      await prisma.user.delete({
        where: { id: user.id },
      });

      const foundProfile = await prisma.studentProfile.findUnique({
        where: { id: profileId },
      });
      expect(foundProfile).toBeNull();
    });
  });
});
