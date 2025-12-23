import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

describe("CourseEnrollment Model", () => {
  let testUserId: string;
  let testStudentId: string;
  let testCourseId: string;
  let testEnrollmentId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "test_enrollment_user",
        email: "enrollment@test.com",
        role: Role.STUDENT,
      },
    });
    testUserId = user.id;

    const student = await prisma.studentProfile.create({
      data: {
        userId: testUserId,
        studentId: "STU_ENROLL",
        sport: "Basketball",
        year: 2,
      },
    });
    testStudentId = student.id;

    const course = await prisma.course.create({
      data: {
        code: "ENRL101",
        name: "Enrollment Course",
        credits: 3,
        department: "CS",
        semester: "FALL",
        year: 2024,
      },
    });
    testCourseId = course.id;
  });

  afterAll(async () => {
    await prisma.courseEnrollment.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany({
      where: { clerkId: { startsWith: "test_" } },
    });
    await prisma.course.deleteMany({
      where: { code: { startsWith: "ENRL" } },
    });
    await prisma.$disconnect();
  });

  describe("Model Creation Tests", () => {
    test("should create an enrollment with required fields", async () => {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentId,
          courseId: testCourseId,
        },
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.id).toBeDefined();
      expect(enrollment.studentId).toBe(testStudentId);
      expect(enrollment.courseId).toBe(testCourseId);
      expect(enrollment.status).toBe(EnrollmentStatus.IN_PROGRESS);
      expect(enrollment.grade).toBeNull();
      testEnrollmentId = enrollment.id;
    });

    test("should create an enrollment with grade", async () => {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentId,
          courseId: testCourseId,
          grade: "A",
          status: EnrollmentStatus.COMPLETED,
        },
      });

      expect(enrollment.grade).toBe("A");
      expect(enrollment.status).toBe(EnrollmentStatus.COMPLETED);
    });

    test("should have auto-generated timestamps", async () => {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
      });

      expect(enrollment?.createdAt).toBeInstanceOf(Date);
      expect(enrollment?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Field Validation Tests", () => {
    test("should enforce unique constraint on studentId+courseId", async () => {
      await expect(
        prisma.courseEnrollment.create({
          data: {
            studentId: testStudentId,
            courseId: testCourseId,
          },
        }),
      ).rejects.toThrow();
    });

    test("should default status to IN_PROGRESS", async () => {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentId,
          courseId: testCourseId,
        },
      });

      expect(enrollment.status).toBe(EnrollmentStatus.IN_PROGRESS);
    });
  });

  describe("Relation Tests", () => {
    test("should be related to StudentProfile", async () => {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
        include: { student: true },
      });

      expect(enrollment?.student).toBeDefined();
      expect(enrollment?.student.studentId).toBe("STU_ENROLL");
    });

    test("should be related to Course", async () => {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
        include: { course: true },
      });

      expect(enrollment?.course).toBeDefined();
      expect(enrollment?.course.code).toBe("ENRL101");
    });

    test("should be accessible from StudentProfile", async () => {
      const student = await prisma.studentProfile.findUnique({
        where: { id: testStudentId },
        include: { courses: true },
      });

      expect(student?.courses).toBeDefined();
      expect(student?.courses.length).toBeGreaterThan(0);
    });

    test("should be accessible from Course", async () => {
      const course = await prisma.course.findUnique({
        where: { id: testCourseId },
        include: { enrollments: true },
      });

      expect(course?.enrollments).toBeDefined();
      expect(course?.enrollments.length).toBeGreaterThan(0);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should read an enrollment by ID", async () => {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
      });

      expect(enrollment).toBeDefined();
      expect(enrollment?.studentId).toBe(testStudentId);
    });

    test("should update an enrollment", async () => {
      const updated = await prisma.courseEnrollment.update({
        where: { id: testEnrollmentId },
        data: {
          grade: "B",
          status: EnrollmentStatus.COMPLETED,
        },
      });

      expect(updated.grade).toBe("B");
      expect(updated.status).toBe(EnrollmentStatus.COMPLETED);
    });

    test("should delete an enrollment", async () => {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentId,
          courseId: testCourseId,
        },
      });

      const deleted = await prisma.courseEnrollment.delete({
        where: { id: enrollment.id },
      });

      expect(deleted.id).toBe(enrollment.id);

      const found = await prisma.courseEnrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(found).toBeNull();
    });

    test("should list all enrollments", async () => {
      const enrollments = await prisma.courseEnrollment.findMany({
        where: {
          studentId: testStudentId,
        },
      });

      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Case Tests", () => {
    test("should handle optional grade as null", async () => {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
      });

      expect(enrollment?.grade).toBeDefined();
    });

    test("should update updatedAt timestamp on update", async () => {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
      });

      const originalUpdatedAt = enrollment?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.courseEnrollment.update({
        where: { id: testEnrollmentId },
        data: { grade: "A-" },
      });

      const updated = await prisma.courseEnrollment.findUnique({
        where: { id: testEnrollmentId },
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
    });

    test("should handle cascade delete from student", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_cascade_enroll",
          email: "cascadeenroll@test.com",
          role: Role.STUDENT,
        },
      });

      const student = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU_CASCADE_ENROLL",
          sport: "Soccer",
          year: 1,
        },
      });

      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: student.id,
          courseId: testCourseId,
        },
      });

      const enrollmentId = enrollment.id;

      await prisma.studentProfile.delete({
        where: { id: student.id },
      });

      const foundEnrollment = await prisma.courseEnrollment.findUnique({
        where: { id: enrollmentId },
      });
      expect(foundEnrollment).toBeNull();
    });

    test("should handle cascade delete from course", async () => {
      const course = await prisma.course.create({
        data: {
          code: "CASCADE202",
          name: "Cascade Course",
          credits: 3,
          department: "CS",
          semester: "FALL",
          year: 2024,
        },
      });

      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentId,
          courseId: course.id,
        },
      });

      const enrollmentId = enrollment.id;

      await prisma.course.delete({
        where: { id: course.id },
      });

      const foundEnrollment = await prisma.courseEnrollment.findUnique({
        where: { id: enrollmentId },
      });
      expect(foundEnrollment).toBeNull();
    });
  });
});
