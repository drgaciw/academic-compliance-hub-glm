import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EnrollmentStatus = {
  IN_PROGRESS: "IN_PROGRESS" as const,
  COMPLETED: "COMPLETED" as const,
  DROPPED: "DROPPED" as const,
  WITHDRAWN: "WITHDRAWN" as const,
};

describe("Course Model", () => {
  let testCourseId: string;
  let testUserId: string;
  let testStudentId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "test_course_user",
        email: "course@test.com",
      },
    });
    testUserId = user.id;

    const student = await prisma.studentProfile.create({
      data: {
        userId: testUserId,
        studentId: "STU_COURSE",
        sport: "Basketball",
        year: 1,
      },
    });
    testStudentId = student.id;
  });

  afterAll(async () => {
    await prisma.courseEnrollment.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany({
      where: { clerkId: { startsWith: "test_" } },
    });
    await prisma.course.deleteMany({
      where: { code: { startsWith: "TEST" } },
    });
    await prisma.$disconnect();
  });

  describe("Model Creation Tests", () => {
    test("should create a course with all fields", async () => {
      const course = await prisma.course.create({
        data: {
          code: "TEST101",
          name: "Introduction to Testing",
          credits: 3,
          department: "CS",
          semester: "FALL",
          year: 2024,
        },
      });

      expect(course).toBeDefined();
      expect(course.id).toBeDefined();
      expect(course.code).toBe("TEST101");
      expect(course.name).toBe("Introduction to Testing");
      expect(course.credits).toBe(3);
      expect(course.department).toBe("CS");
      expect(course.semester).toBe("FALL");
      expect(course.year).toBe(2024);
      testCourseId = course.id;
    });

    test("should have auto-generated timestamps", async () => {
      const course = await prisma.course.findUnique({
        where: { id: testCourseId },
      });

      expect(course?.createdAt).toBeInstanceOf(Date);
      expect(course?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Field Validation Tests", () => {
    test("should enforce unique constraint on code+semester+year", async () => {
      await expect(
        prisma.course.create({
          data: {
            code: "TEST101",
            name: "Duplicate Course",
            credits: 3,
            department: "CS",
            semester: "FALL",
            year: 2024,
          },
        }),
      ).rejects.toThrow();
    });

    test("should allow same code in different semester", async () => {
      const course = await prisma.course.create({
        data: {
          code: "TEST101",
          name: "Spring Course",
          credits: 3,
          department: "CS",
          semester: "SPRING",
          year: 2024,
        },
      });

      expect(course).toBeDefined();
      expect(course.code).toBe("TEST101");
      expect(course.semester).toBe("SPRING");
    });

    test("should allow same code in different year", async () => {
      const course = await prisma.course.create({
        data: {
          code: "TEST101",
          name: "Next Year Course",
          credits: 3,
          department: "CS",
          semester: "FALL",
          year: 2025,
        },
      });

      expect(course).toBeDefined();
      expect(course.year).toBe(2025);
    });
  });

  describe("Relation Tests", () => {
    test("should create course enrollment", async () => {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: testStudentId,
          courseId: testCourseId,
          status: EnrollmentStatus.IN_PROGRESS,
        },
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.courseId).toBe(testCourseId);
    });

    test("should find enrollments through relation", async () => {
      const course = await prisma.course.findUnique({
        where: { id: testCourseId },
        include: { enrollments: true },
      });

      expect(course?.enrollments).toBeDefined();
      expect(course?.enrollments.length).toBeGreaterThan(0);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should read a course by ID", async () => {
      const course = await prisma.course.findUnique({
        where: { id: testCourseId },
      });

      expect(course).toBeDefined();
      expect(course?.code).toBe("TEST101");
    });

    test("should read a course by unique constraint", async () => {
      const course = await prisma.course.findUnique({
        where: {
          code_semester_year: {
            code: "TEST101",
            semester: "FALL",
            year: 2024,
          },
        },
      });

      expect(course).toBeDefined();
      expect(course?.id).toBe(testCourseId);
    });

    test("should update a course", async () => {
      const updated = await prisma.course.update({
        where: { id: testCourseId },
        data: {
          name: "Updated Course Name",
          credits: 4,
        },
      });

      expect(updated.name).toBe("Updated Course Name");
      expect(updated.credits).toBe(4);
    });

    test("should delete a course", async () => {
      const course = await prisma.course.create({
        data: {
          code: "TEST999",
          name: "To Delete",
          credits: 3,
          department: "CS",
          semester: "FALL",
          year: 2024,
        },
      });

      const deleted = await prisma.course.delete({
        where: { id: course.id },
      });

      expect(deleted.id).toBe(course.id);

      const found = await prisma.course.findUnique({
        where: { id: course.id },
      });
      expect(found).toBeNull();
    });

    test("should list all courses", async () => {
      const courses = await prisma.course.findMany({
        where: {
          code: { startsWith: "TEST" },
        },
      });

      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Case Tests", () => {
    test("should update updatedAt timestamp on update", async () => {
      const course = await prisma.course.findUnique({
        where: { id: testCourseId },
      });

      const originalUpdatedAt = course?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.course.update({
        where: { id: testCourseId },
        data: { name: "Updated Again" },
      });

      const updated = await prisma.course.findUnique({
        where: { id: testCourseId },
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
    });

    test("should handle empty string fields", async () => {
      const course = await prisma.course.create({
        data: {
          code: "TESTEMPTY",
          name: "",
          credits: 0,
          department: "",
          semester: "SUMMER",
          year: 2024,
        },
      });

      expect(course.name).toBe("");
      expect(course.department).toBe("");
    });

    test("should filter courses by department", async () => {
      const courses = await prisma.course.findMany({
        where: {
          department: "CS",
        },
      });

      expect(Array.isArray(courses)).toBe(true);
      expect(courses.every((c) => c.department === "CS")).toBe(true);
    });
  });
});
