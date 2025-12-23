import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Role = {
  STUDENT: "STUDENT" as const,
  ADVISOR: "ADVISOR" as const,
  ADMIN: "ADMIN" as const,
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER" as const,
};

const ComplianceStatus = {
  PENDING: "PENDING" as const,
  COMPLETED: "COMPLETED" as const,
  FAILED: "FAILED" as const,
  EXEMPTED: "EXEMPTED" as const,
};

describe("ComplianceRecord Model", () => {
  let testUserId: string;
  let testStudentId: string;
  let testRecordId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "test_compliance_user",
        email: "compliance@test.com",
        role: Role.STUDENT,
      },
    });
    testUserId = user.id;

    const student = await prisma.studentProfile.create({
      data: {
        userId: testUserId,
        studentId: "STU_COMPL",
        sport: "Basketball",
        year: 2,
      },
    });
    testStudentId = student.id;
  });

  afterAll(async () => {
    await prisma.complianceRecord.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany({
      where: { clerkId: { startsWith: "test_" } },
    });
    await prisma.$disconnect();
  });

  describe("Model Creation Tests", () => {
    test("should create a compliance record with required fields", async () => {
      const record = await prisma.complianceRecord.create({
        data: {
          studentId: testStudentId,
          category: "Academic",
          requirement: "Maintain 2.0 GPA",
        },
      });

      expect(record).toBeDefined();
      expect(record.id).toBeDefined();
      expect(record.studentId).toBe(testStudentId);
      expect(record.category).toBe("Academic");
      expect(record.requirement).toBe("Maintain 2.0 GPA");
      expect(record.status).toBe(ComplianceStatus.PENDING);
      expect(record.notes).toBeNull();
      expect(record.dueDate).toBeNull();
      expect(record.completedAt).toBeNull();
      testRecordId = record.id;
    });

    test("should create a compliance record with optional fields", async () => {
      const record = await prisma.complianceRecord.create({
        data: {
          studentId: testStudentId,
          category: "Financial",
          requirement: "Submit FAFSA",
          status: ComplianceStatus.COMPLETED,
          notes: "Submitted on time",
          dueDate: new Date("2024-12-31"),
          completedAt: new Date("2024-01-15"),
        },
      });

      expect(record.category).toBe("Financial");
      expect(record.status).toBe(ComplianceStatus.COMPLETED);
      expect(record.notes).toBe("Submitted on time");
      expect(record.dueDate).toBeInstanceOf(Date);
      expect(record.completedAt).toBeInstanceOf(Date);
    });

    test("should have auto-generated timestamps", async () => {
      const record = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });

      expect(record?.createdAt).toBeInstanceOf(Date);
      expect(record?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Field Validation Tests", () => {
    test("should default status to PENDING", async () => {
      const record = await prisma.complianceRecord.create({
        data: {
          studentId: testStudentId,
          category: "Testing",
          requirement: "Test Requirement",
        },
      });

      expect(record.status).toBe(ComplianceStatus.PENDING);
    });

    test("should handle notes as optional", async () => {
      const record = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });

      expect(record?.notes).toBeNull();
    });

    test("should handle dates as optional", async () => {
      const record = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });

      expect(record?.dueDate).toBeNull();
      expect(record?.completedAt).toBeNull();
    });
  });

  describe("Relation Tests", () => {
    test("should be related to StudentProfile", async () => {
      const record = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
        include: { student: true },
      });

      expect(record?.student).toBeDefined();
      expect(record?.student.studentId).toBe("STU_COMPL");
    });

    test("should be accessible from StudentProfile", async () => {
      const student = await prisma.studentProfile.findUnique({
        where: { id: testStudentId },
        include: { complianceRecords: true },
      });

      expect(student?.complianceRecords).toBeDefined();
      expect(student?.complianceRecords.length).toBeGreaterThan(0);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should read a compliance record by ID", async () => {
      const record = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });

      expect(record).toBeDefined();
      expect(record?.category).toBe("Academic");
    });

    test("should update a compliance record", async () => {
      const updated = await prisma.complianceRecord.update({
        where: { id: testRecordId },
        data: {
          status: ComplianceStatus.COMPLETED,
          notes: "All requirements met",
          completedAt: new Date("2024-01-20"),
        },
      });

      expect(updated.status).toBe(ComplianceStatus.COMPLETED);
      expect(updated.notes).toBe("All requirements met");
      expect(updated.completedAt).toBeInstanceOf(Date);
    });

    test("should delete a compliance record", async () => {
      const record = await prisma.complianceRecord.create({
        data: {
          studentId: testStudentId,
          category: "Test Delete",
          requirement: "To Delete",
        },
      });

      const deleted = await prisma.complianceRecord.delete({
        where: { id: record.id },
      });

      expect(deleted.id).toBe(record.id);

      const found = await prisma.complianceRecord.findUnique({
        where: { id: record.id },
      });
      expect(found).toBeNull();
    });

    test("should list all compliance records", async () => {
      const records = await prisma.complianceRecord.findMany({
        where: {
          studentId: testStudentId,
        },
      });

      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Case Tests", () => {
    test("should handle different status values", async () => {
      const statuses = [
        ComplianceStatus.PENDING,
        ComplianceStatus.COMPLETED,
        ComplianceStatus.FAILED,
        ComplianceStatus.EXEMPTED,
      ];

      for (const status of statuses) {
        const record = await prisma.complianceRecord.create({
          data: {
            studentId: testStudentId,
            category: "Status Test",
            requirement: `Test ${status}`,
            status,
          },
        });

        expect(record.status).toBe(status);
      }
    });

    test("should update updatedAt timestamp on update", async () => {
      const record = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });

      const originalUpdatedAt = record?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.complianceRecord.update({
        where: { id: testRecordId },
        data: { notes: "Updated" },
      });

      const updated = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
    });

    test("should handle cascade delete from student", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_cascade_compl",
          email: "cascadecompl@test.com",
          role: Role.STUDENT,
        },
      });

      const student = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: "STU_CASCADE_COMPL",
          sport: "Soccer",
          year: 1,
        },
      });

      const record = await prisma.complianceRecord.create({
        data: {
          studentId: student.id,
          category: "Cascade Test",
          requirement: "Test",
        },
      });

      const recordId = record.id;

      await prisma.studentProfile.delete({
        where: { id: student.id },
      });

      const foundRecord = await prisma.complianceRecord.findUnique({
        where: { id: recordId },
      });
      expect(foundRecord).toBeNull();
    });

    test("should filter records by status", async () => {
      const pendingRecords = await prisma.complianceRecord.findMany({
        where: {
          studentId: testStudentId,
          status: ComplianceStatus.PENDING,
        },
      });

      expect(Array.isArray(pendingRecords)).toBe(true);
      expect(
        pendingRecords.every((r: any) => r.status === ComplianceStatus.PENDING),
      ).toBe(true);
    });

    test("should filter records by category", async () => {
      const academicRecords = await prisma.complianceRecord.findMany({
        where: {
          studentId: testStudentId,
          category: "Academic",
        },
      });

      expect(Array.isArray(academicRecords)).toBe(true);
      expect(academicRecords.every((r: any) => r.category === "Academic")).toBe(
        true,
      );
    });
  });
});
