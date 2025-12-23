import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Role = {
  STUDENT: "STUDENT" as const,
  ADVISOR: "ADVISOR" as const,
  ADMIN: "ADMIN" as const,
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER" as const,
};

const SessionStatus = {
  SCHEDULED: "SCHEDULED" as const,
  COMPLETED: "COMPLETED" as const,
  CANCELLED: "CANCELLED" as const,
};

describe("TutoringSession Model", () => {
  let testUserId: string;
  let testStudentId: string;
  let testSessionId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "test_tutor_user",
        email: "tutor@test.com",
        role: Role.STUDENT,
      },
    });
    testUserId = user.id;

    const student = await prisma.studentProfile.create({
      data: {
        userId: testUserId,
        studentId: "STU_TUTOR",
        sport: "Basketball",
        year: 2,
      },
    });
    testStudentId = student.id;
  });

  afterAll(async () => {
    await prisma.tutoringSession.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany({
      where: { clerkId: { startsWith: "test_" } },
    });
    await prisma.$disconnect();
  });

  describe("Model Creation Tests", () => {
    test("should create a tutoring session with required fields", async () => {
      const session = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentId,
          subject: "Math",
          date: new Date("2024-01-15T10:00:00Z"),
          duration: 60,
        },
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.studentId).toBe(testStudentId);
      expect(session.subject).toBe("Math");
      expect(session.duration).toBe(60);
      expect(session.status).toBe(SessionStatus.SCHEDULED);
      expect(session.notes).toBeNull();
      testSessionId = session.id;
    });

    test("should create a tutoring session with optional fields", async () => {
      const session = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentId,
          subject: "English",
          date: new Date("2024-01-16T14:00:00Z"),
          duration: 90,
          notes: "Focus on essay writing",
          status: SessionStatus.COMPLETED,
        },
      });

      expect(session.notes).toBe("Focus on essay writing");
      expect(session.status).toBe(SessionStatus.COMPLETED);
    });

    test("should have auto-generated timestamps", async () => {
      const session = await prisma.tutoringSession.findUnique({
        where: { id: testSessionId },
      });

      expect(session?.createdAt).toBeInstanceOf(Date);
      expect(session?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Field Validation Tests", () => {
    test("should default status to SCHEDULED", async () => {
      const session = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentId,
          subject: "Science",
          date: new Date("2024-01-17T09:00:00Z"),
          duration: 45,
        },
      });

      expect(session.status).toBe(SessionStatus.SCHEDULED);
    });

    test("should handle notes as optional", async () => {
      const session = await prisma.tutoringSession.findUnique({
        where: { id: testSessionId },
      });

      expect(session?.notes).toBeNull();
    });
  });

  describe("Relation Tests", () => {
    test("should be related to StudentProfile", async () => {
      const session = await prisma.tutoringSession.findUnique({
        where: { id: testSessionId },
        include: { student: true },
      });

      expect(session?.student).toBeDefined();
      expect(session?.student.studentId).toBe("STU_TUTOR");
    });

    test("should be accessible from StudentProfile", async () => {
      const student = await prisma.studentProfile.findUnique({
        where: { id: testStudentId },
        include: { tutoringSessions: true },
      });

      expect(student?.tutoringSessions).toBeDefined();
      expect(student?.tutoringSessions.length).toBeGreaterThan(0);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should read a tutoring session by ID", async () => {
      const session = await prisma.tutoringSession.findUnique({
        where: { id: testSessionId },
      });

      expect(session).toBeDefined();
      expect(session?.subject).toBe("Math");
    });

    test("should update a tutoring session", async () => {
      const updated = await prisma.tutoringSession.update({
        where: { id: testSessionId },
        data: {
          duration: 90,
          notes: "Extended session",
          status: SessionStatus.COMPLETED,
        },
      });

      expect(updated.duration).toBe(90);
      expect(updated.notes).toBe("Extended session");
      expect(updated.status).toBe(SessionStatus.COMPLETED);
    });

    test("should delete a tutoring session", async () => {
      const session = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentId,
          subject: "History",
          date: new Date("2024-01-18T11:00:00Z"),
          duration: 60,
        },
      });

      const deleted = await prisma.tutoringSession.delete({
        where: { id: session.id },
      });

      expect(deleted.id).toBe(session.id);

      const found = await prisma.tutoringSession.findUnique({
        where: { id: session.id },
      });
      expect(found).toBeNull();
    });

    test("should list all tutoring sessions", async () => {
      const sessions = await prisma.tutoringSession.findMany({
        where: {
          studentId: testStudentId,
        },
      });

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Case Tests", () => {
    test("should handle different session statuses", async () => {
      const cancelled = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentId,
          subject: "Cancelled Session",
          date: new Date("2024-01-19T10:00:00Z"),
          duration: 60,
          status: SessionStatus.CANCELLED,
        },
      });

      expect(cancelled.status).toBe(SessionStatus.CANCELLED);
    });

    test("should handle zero duration", async () => {
      const session = await prisma.tutoringSession.create({
        data: {
          studentId: testStudentId,
          subject: "Zero Duration",
          date: new Date("2024-01-20T10:00:00Z"),
          duration: 0,
        },
      });

      expect(session.duration).toBe(0);
    });

    test("should update updatedAt timestamp on update", async () => {
      const session = await prisma.tutoringSession.findUnique({
        where: { id: testSessionId },
      });

      const originalUpdatedAt = session?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.tutoringSession.update({
        where: { id: testSessionId },
        data: { notes: "Updated notes" },
      });

      const updated = await prisma.tutoringSession.findUnique({
        where: { id: testSessionId },
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
    });

    test("should handle cascade delete from student", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_cascade_tutor",
          email: "cascadetutor@test.com",
          role: Role.STUDENT,
        },
      });

      const student = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU_CASCADE_TUTOR",
          sport: "Swimming",
          year: 1,
        },
      });

      const session = await prisma.tutoringSession.create({
        data: {
          studentId: student.id,
          subject: "Cascade Session",
          date: new Date("2024-01-21T10:00:00Z"),
          duration: 60,
        },
      });

      const sessionId = session.id;

      await prisma.studentProfile.delete({
        where: { id: student.id },
      });

      const foundSession = await prisma.tutoringSession.findUnique({
        where: { id: sessionId },
      });
      expect(foundSession).toBeNull();
    });
  });
});
