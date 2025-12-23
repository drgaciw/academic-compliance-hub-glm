import { PrismaClient } from "@prisma/client";

const Role = {
  STUDENT: "STUDENT" as const,
  ADVISOR: "ADVISOR" as const,
  ADMIN: "ADMIN" as const,
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER" as const,
};

const prisma = new PrismaClient();

describe("User Model", () => {
  let testUserId: string;

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        clerkId: { startsWith: "test_" },
      },
    });
    await prisma.$disconnect();
  });

  describe("Model Creation Tests", () => {
    test("should create a user with required fields", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_create_user",
          email: "test@example.com",
        },
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.clerkId).toBe("test_create_user");
      expect(user.email).toBe("test@example.com");
      expect(user.role).toBe(Role.STUDENT);
      testUserId = user.id;
    });

    test("should create a user with all fields", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_full_user",
          email: "full@example.com",
          firstName: "John",
          lastName: "Doe",
          role: Role.ADVISOR,
        },
      });

      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.role).toBe(Role.ADVISOR);
    });

    test("should have auto-generated timestamps", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_timestamp_user",
          email: "timestamp@example.com",
        },
      });

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Field Validation Tests", () => {
    test("should enforce unique constraint on clerkId", async () => {
      await expect(
        prisma.user.create({
          data: {
            clerkId: "test_create_user",
            email: "duplicate@example.com",
          },
        }),
      ).rejects.toThrow();
    });

    test("should enforce unique constraint on email", async () => {
      await expect(
        prisma.user.create({
          data: {
            clerkId: "test_duplicate_email",
            email: "test@example.com",
          },
        }),
      ).rejects.toThrow();
    });

    test("should default role to STUDENT", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_default_role",
          email: "defaultrole@example.com",
        },
      });

      expect(user.role).toBe(Role.STUDENT);
    });
  });

  describe("CRUD Operation Tests", () => {
    test("should read a user by ID", async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(user).toBeDefined();
      expect(user?.clerkId).toBe("test_create_user");
    });

    test("should read a user by email", async () => {
      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });

      expect(user).toBeDefined();
      expect(user?.clerkId).toBe("test_create_user");
    });

    test("should update a user", async () => {
      const updated = await prisma.user.update({
        where: { id: testUserId },
        data: {
          firstName: "Jane",
          lastName: "Smith",
          role: Role.ADMIN,
        },
      });

      expect(updated.firstName).toBe("Jane");
      expect(updated.lastName).toBe("Smith");
      expect(updated.role).toBe(Role.ADMIN);
    });

    test("should delete a user", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_delete_user",
          email: "delete@example.com",
        },
      });

      const deleted = await prisma.user.delete({
        where: { id: user.id },
      });

      expect(deleted.id).toBe(user.id);

      const found = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(found).toBeNull();
    });

    test("should list all users", async () => {
      const users = await prisma.user.findMany({
        where: {
          clerkId: { startsWith: "test_" },
        },
      });

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Case Tests", () => {
    test("should handle optional fields as null", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_optional_fields",
          email: "optional@example.com",
        },
      });

      expect(user.firstName).toBeNull();
      expect(user.lastName).toBeNull();
    });

    test("should update updatedAt timestamp on update", async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      const originalUpdatedAt = user?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.user.update({
        where: { id: testUserId },
        data: { firstName: "Updated" },
      });

      const updated = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
    });

    test("should handle empty string for optional fields", async () => {
      const user = await prisma.user.create({
        data: {
          clerkId: "test_empty_string",
          email: "empty@example.com",
          firstName: "",
          lastName: "",
        },
      });

      expect(user.firstName).toBe("");
      expect(user.lastName).toBe("");
    });
  });
});
