import { describe, it, expect } from "@jest/globals";
import app from "../src/index";

describe("User Service API Tests", () => {
  describe("H2-002-016: Health Check", () => {
    it("should return 200 status", async () => {
      const response = await app.request("/health");
      expect(response.status).toBe(200);
    });

    it("should return service information", async () => {
      const response = await app.request("/health");
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe("ok");
      expect(data.data.service).toBe("user");
    });
  });

  describe("H2-002-017: Get User Profile", () => {
    it("should return user profile", async () => {
      const response = await app.request("/users/12345");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("12345");
    });

    it("should include user name", async () => {
      const response = await app.request("/users/12345");
      const data = await response.json();

      expect(data.data.name).toBeDefined();
      expect(typeof data.data.name).toBe("string");
    });

    it("should include user email", async () => {
      const response = await app.request("/users/12345");
      const data = await response.json();

      expect(data.data.email).toBeDefined();
      expect(typeof data.data.email).toBe("string");
    });

    it("should handle invalid user ID", async () => {
      const response = await app.request("/users/invalid");
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("H2-002-018: Create User", () => {
    it("should create user", async () => {
      const response = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "STUDENT",
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe("newuser@example.com");
    });

    it("should validate email format", async () => {
      const response = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          firstName: "John",
          lastName: "Doe",
          role: "STUDENT",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require email", async () => {
      const response = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          role: "STUDENT",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require firstName", async () => {
      const response = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          lastName: "Doe",
          role: "STUDENT",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require lastName", async () => {
      const response = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          firstName: "John",
          role: "STUDENT",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should validate role enum", async () => {
      const validRoles = ["STUDENT", "ADVISOR", "ADMIN", "COMPLIANCE_OFFICER"];

      for (const role of validRoles) {
        const response = await app.request("/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            role: role,
          }),
        });
        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid role", async () => {
      const response = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "INVALID_ROLE",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("H2-002-019: Update User", () => {
    it("should update user", async () => {
      const response = await app.request("/users/12345", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Jane",
          lastName: "Smith",
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("12345");
    });

    it("should update firstName", async () => {
      const response = await app.request("/users/12345", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "UpdatedName",
        }),
      });
      const data = await response.json();

      expect(data.data.firstName).toBe("UpdatedName");
    });

    it("should update lastName", async () => {
      const response = await app.request("/users/12345", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: "UpdatedLastName",
        }),
      });
      const data = await response.json();

      expect(data.data.lastName).toBe("UpdatedLastName");
    });

    it("should update role", async () => {
      const response = await app.request("/users/12345", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "ADMIN",
        }),
      });
      const data = await response.json();

      expect(data.data.role).toBe("ADMIN");
    });

    it("should handle partial updates", async () => {
      const response = await app.request("/users/12345", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "OnlyFirst",
        }),
      });

      expect(response.status).toBe(200);
    });
  });

  describe("H2-002-020: Delete User", () => {
    it("should delete user", async () => {
      const response = await app.request("/users/12345", {
        method: "DELETE",
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("12345");
    });

    it("should handle invalid user ID", async () => {
      const response = await app.request("/users/invalid", {
        method: "DELETE",
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
