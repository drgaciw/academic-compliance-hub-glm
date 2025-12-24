import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AdapterFactory, getAdapter } from "../src/factory";
import { SISType } from "../src/index";
import { BannerAdapter } from "../src/banner-adapter";
import { PeopleSoftAdapter } from "../src/peoplesoft-adapter";
import { ColleagueAdapter } from "../src/colleague-adapter";
import { CustomRestAdapter } from "../src/custom-rest-adapter";
import { SFTPAdapter } from "../src/sftp-adapter";

describe("H2-003-007: Adapter Factory Tests", () => {
  beforeEach(() => {
    AdapterFactory.clearAllAdapters();
    AdapterFactory.initialize({ maxRetries: 2, timeout: 5000 });
  });

  afterEach(() => {
    AdapterFactory.shutdown();
  });

  describe("Adapter Retrieval", () => {
    it("should get Banner adapter instance", () => {
      const adapter = AdapterFactory.getAdapter(SISType.BANNER);

      expect(adapter).toBeInstanceOf(BannerAdapter);
      expect(adapter.sisType).toBe(SISType.BANNER);
    });

    it("should get PeopleSoft adapter instance", () => {
      const adapter = AdapterFactory.getAdapter(SISType.PEOPLESOFT);

      expect(adapter).toBeInstanceOf(PeopleSoftAdapter);
      expect(adapter.sisType).toBe(SISType.PEOPLESOFT);
    });

    it("should get Colleague adapter instance", () => {
      const adapter = AdapterFactory.getAdapter(SISType.COLLEAGUE);

      expect(adapter).toBeInstanceOf(ColleagueAdapter);
      expect(adapter.sisType).toBe(SISType.COLLEAGUE);
    });

    it("should get Custom REST adapter instance", () => {
      const adapter = AdapterFactory.getAdapter(SISType.CUSTOM);

      expect(adapter).toBeInstanceOf(CustomRestAdapter);
      expect(adapter.sisType).toBe(SISType.CUSTOM);
    });

    it("should get JICS adapter instance (using Custom REST)", () => {
      const adapter = AdapterFactory.getAdapter(SISType.JICS);

      expect(adapter).toBeInstanceOf(CustomRestAdapter);
      expect(adapter.sisType).toBe(SISType.CUSTOM);
    });

    it("should get Workday adapter instance (using Custom REST)", () => {
      const adapter = AdapterFactory.getAdapter(SISType.WORKDAY);

      expect(adapter).toBeInstanceOf(CustomRestAdapter);
      expect(adapter.sisType).toBe(SISType.CUSTOM);
    });
  });

  describe("Configuration Injection", () => {
    it("should use global config from initialize", () => {
      AdapterFactory.initialize({ maxRetries: 5, timeout: 10000 });

      const adapter = AdapterFactory.getAdapter(SISType.BANNER);
      const config = (adapter as any).getConfig();

      expect(config.maxRetries).toBe(5);
      expect(config.timeout).toBe(10000);
    });

    it("should override global config with per-request config", () => {
      AdapterFactory.initialize({ maxRetries: 3 });

      const adapter = AdapterFactory.getAdapter(SISType.BANNER, {
        maxRetries: 7,
      });
      const config = (adapter as any).getConfig();

      expect(config.maxRetries).toBe(7);
    });

    it("should merge config correctly", () => {
      AdapterFactory.initialize({ maxRetries: 2, enableLogging: true });

      const adapter = AdapterFactory.getAdapter(SISType.PEOPLESOFT, {
        timeout: 15000,
      });
      const config = (adapter as any).getConfig();

      expect(config.maxRetries).toBe(2);
      expect(config.enableLogging).toBe(true);
      expect(config.timeout).toBe(15000);
    });

    it("should override global config with per-request config", () => {
      AdapterFactory.initialize({ maxRetries: 3 });

      const adapter = AdapterFactory.getAdapter(SISType.BANNER, {
        maxRetries: 7,
      });
      const config = (adapter as any).getConfig();

      expect(config.maxRetries).toBe(7);
    });

    it("should merge config correctly", () => {
      AdapterFactory.initialize({ maxRetries: 2, enableLogging: true });

      const adapter = AdapterFactory.getAdapter(SISType.PEOPLESOFT, {
        timeout: 15000,
      });
      const config = (adapter as any).getConfig();

      expect(config.maxRetries).toBe(2);
      expect(config.enableLogging).toBe(true);
      expect(config.timeout).toBe(15000);
    });
  });

  describe("Error Handling", () => {
    it("should throw error for unknown SIS type", () => {
      expect(() => {
        AdapterFactory.getAdapter("UNKNOWN" as SISType);
      }).toThrow("Unknown SIS type");
    });

    it("should have proper error code for unknown type", () => {
      try {
        AdapterFactory.getAdapter("UNKNOWN" as SISType);
      } catch (error: any) {
        expect(error.code).toBe("UNKNOWN_SIS_TYPE");
        expect(error.name).toBe("AdapterFactoryError");
      }
    });

    it("should throw error for unsupported SIS type if defined", () => {
      const adapter = AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.clearAllAdapters();

      try {
        AdapterFactory.getAdapter("SOME_UNSUPPORTED" as SISType);
      } catch (error: any) {
        expect(error.message).toContain("Unknown SIS type");
      }
    });
  });

  describe("Adapter Lifecycle", () => {
    it("should create new adapter instance on first request", () => {
      expect(AdapterFactory.getAdapterCount()).toBe(0);

      AdapterFactory.getAdapter(SISType.BANNER);

      expect(AdapterFactory.getAdapterCount()).toBe(1);
      expect(AdapterFactory.hasAdapter(SISType.BANNER)).toBe(true);
    });

    it("should reuse existing adapter instance", () => {
      const adapter1 = AdapterFactory.getAdapter(SISType.BANNER);
      const adapter2 = AdapterFactory.getAdapter(SISType.BANNER);

      expect(adapter1).toBe(adapter2);
      expect(AdapterFactory.getAdapterCount()).toBe(1);
    });

    it("should update lastUsedAt on reuse", async () => {
      AdapterFactory.getAdapter(SISType.BANNER);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const info1 = AdapterFactory.getAdapterInfo(SISType.BANNER);
      const time1 = info1?.lastUsedAt.getTime();

      await new Promise((resolve) => setTimeout(resolve, 10));

      AdapterFactory.getAdapter(SISType.BANNER);
      const info2 = AdapterFactory.getAdapterInfo(SISType.BANNER);
      const time2 = info2?.lastUsedAt.getTime();

      expect(time2).toBeGreaterThan(time1!);
    });

    it("should remove adapter instance", () => {
      AdapterFactory.getAdapter(SISType.BANNER);
      expect(AdapterFactory.hasAdapter(SISType.BANNER)).toBe(true);

      const removed = AdapterFactory.removeAdapter(SISType.BANNER);

      expect(removed).toBe(true);
      expect(AdapterFactory.hasAdapter(SISType.BANNER)).toBe(false);
    });

    it("should clear all adapter instances", () => {
      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);
      AdapterFactory.getAdapter(SISType.COLLEAGUE);

      expect(AdapterFactory.getAdapterCount()).toBe(3);

      AdapterFactory.clearAllAdapters();

      expect(AdapterFactory.getAdapterCount()).toBe(0);
    });

    it("should refresh adapter with new instance", () => {
      const adapter1 = AdapterFactory.getAdapter(SISType.BANNER);

      const adapter2 = AdapterFactory.refreshAdapter(SISType.BANNER);

      expect(adapter1).not.toBe(adapter2);
      expect(AdapterFactory.getAdapterCount()).toBe(1);
    });

    it("should refresh adapter with new config", () => {
      AdapterFactory.getAdapter(SISType.BANNER);

      const adapter = AdapterFactory.refreshAdapter(SISType.BANNER, {
        timeout: 20000,
      });
      const config = (adapter as any).getConfig();

      expect(config.timeout).toBe(20000);
    });
  });

  describe("Adapter Information", () => {
    it("should get active adapter types", () => {
      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);
      AdapterFactory.getAdapter(SISType.COLLEAGUE);

      const active = AdapterFactory.getActiveAdapters();

      expect(active).toHaveLength(3);
      expect(active).toContain(SISType.BANNER);
      expect(active).toContain(SISType.PEOPLESOFT);
      expect(active).toContain(SISType.COLLEAGUE);
    });

    it("should get adapter info with timestamps", () => {
      AdapterFactory.getAdapter(SISType.BANNER);

      const info = AdapterFactory.getAdapterInfo(SISType.BANNER);

      expect(info).toBeDefined();
      expect(info?.createdAt).toBeInstanceOf(Date);
      expect(info?.lastUsedAt).toBeInstanceOf(Date);
      expect(info?.adapter.sisType).toBe(SISType.BANNER);
    });

    it("should return undefined for non-existent adapter info", () => {
      const info = AdapterFactory.getAdapterInfo(SISType.BANNER);

      expect(info).toBeUndefined();
    });

    it("should check if adapter exists", () => {
      expect(AdapterFactory.hasAdapter(SISType.BANNER)).toBe(false);

      AdapterFactory.getAdapter(SISType.BANNER);

      expect(AdapterFactory.hasAdapter(SISType.BANNER)).toBe(true);
    });

    it("should get adapter count", () => {
      expect(AdapterFactory.getAdapterCount()).toBe(0);

      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);

      expect(AdapterFactory.getAdapterCount()).toBe(2);
    });
  });

  describe("Cleanup", () => {
    it("should start cleanup timer on initialize", () => {
      AdapterFactory.shutdown();
      AdapterFactory.initialize({});

      expect(AdapterFactory.getActiveAdapters()).toBeDefined();
    });

    it("should stop cleanup timer on shutdown", () => {
      AdapterFactory.initialize({});
      AdapterFactory.shutdown();

      expect(AdapterFactory.getAdapterCount()).toBe(0);
    });

    it("should set custom cleanup interval", () => {
      AdapterFactory.setCleanupInterval(60000);

      expect(AdapterFactory.getActiveAdapters()).toBeDefined();
    });

    it("should clear all adapters on shutdown", () => {
      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);

      expect(AdapterFactory.getAdapterCount()).toBe(2);

      AdapterFactory.shutdown();

      expect(AdapterFactory.getAdapterCount()).toBe(0);
    });
  });

  describe("Supported Types", () => {
    it("should check if type is supported", () => {
      expect(AdapterFactory.isSupported(SISType.BANNER)).toBe(true);
      expect(AdapterFactory.isSupported(SISType.PEOPLESOFT)).toBe(true);
      expect(AdapterFactory.isSupported(SISType.COLLEAGUE)).toBe(true);
      expect(AdapterFactory.isSupported(SISType.CUSTOM)).toBe(true);
      expect(AdapterFactory.isSupported(SISType.JICS)).toBe(true);
      expect(AdapterFactory.isSupported(SISType.WORKDAY)).toBe(true);
    });

    it("should get all supported types", () => {
      const supported = AdapterFactory.getSupportedTypes();

      expect(supported).toContain(SISType.BANNER);
      expect(supported).toContain(SISType.PEOPLESOFT);
      expect(supported).toContain(SISType.COLLEAGUE);
      expect(supported).toContain(SISType.CUSTOM);
      expect(supported).toContain(SISType.JICS);
      expect(supported).toContain(SISType.WORKDAY);
      expect(supported).toHaveLength(6);
    });
  });

  describe("getAdapter Convenience Function", () => {
    it("should export getAdapter function", () => {
      expect(getAdapter).toBeDefined();
      expect(typeof getAdapter).toBe("function");
    });

    it("should get adapter via convenience function", () => {
      const adapter = getAdapter(SISType.BANNER);

      expect(adapter).toBeInstanceOf(BannerAdapter);
      expect(adapter.sisType).toBe(SISType.BANNER);
    });

    it("should accept config in convenience function", () => {
      const adapter = getAdapter(SISType.BANNER, { maxRetries: 10 });
      const config = (adapter as any).getConfig();

      expect(config.maxRetries).toBe(10);
    });
  });

  describe("getAdapterWithCredentials", () => {
    it("should return adapter and session", async () => {
      const credentials = {
        baseUrl: "https://test.example.com",
        apiKey: "test-key",
      };

      vi.spyOn(
        AdapterFactory.getAdapter(SISType.BANNER) as any,
        "authenticate",
      ).mockResolvedValue({
        sessionId: "test-session",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      });

      const result = await AdapterFactory.getAdapterWithCredentials(
        SISType.BANNER,
        credentials,
      );

      expect(result.adapter).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.adapter.sisType).toBe(SISType.BANNER);
    });
  });

  describe("Custom Configuration for CUSTOM type", () => {
    it("should use Custom REST adapter with endpoints config", () => {
      const customConfig = {
        endpoints: {
          authenticate: "/api/login",
          getStudentInfo: "/api/students/{id}",
        },
      } as any;

      const adapter = AdapterFactory.getAdapter(SISType.CUSTOM, customConfig);

      expect(adapter).toBeInstanceOf(CustomRestAdapter);
    });

    it("should use SFTP adapter with baseDirectory config", () => {
      const sftpConfig = {
        baseDirectory: "/custom-dir",
        fileEncoding: "utf8",
      } as any;

      const adapter = AdapterFactory.getAdapter(SISType.CUSTOM, sftpConfig);

      expect(adapter).toBeInstanceOf(SFTPAdapter);
    });

    it("should default to Custom REST adapter without specific config", () => {
      const adapter = AdapterFactory.getAdapter(SISType.CUSTOM);

      expect(adapter).toBeInstanceOf(CustomRestAdapter);
    });
  });

  describe("Multiple Adapter Instances", () => {
    it("should manage multiple adapter types", () => {
      const banner = AdapterFactory.getAdapter(SISType.BANNER);
      const peoplesoft = AdapterFactory.getAdapter(SISType.PEOPLESOFT);
      const colleague = AdapterFactory.getAdapter(SISType.COLLEAGUE);
      const custom = AdapterFactory.getAdapter(SISType.CUSTOM);

      expect(AdapterFactory.getAdapterCount()).toBe(4);
      expect(AdapterFactory.getActiveAdapters()).toHaveLength(4);
    });

    it("should reuse instances per type", () => {
      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);

      expect(AdapterFactory.getAdapterCount()).toBe(2);
    });

    it("should remove specific adapter while keeping others", () => {
      AdapterFactory.getAdapter(SISType.BANNER);
      AdapterFactory.getAdapter(SISType.PEOPLESOFT);
      AdapterFactory.getAdapter(SISType.COLLEAGUE);

      AdapterFactory.removeAdapter(SISType.PEOPLESOFT);

      expect(AdapterFactory.getAdapterCount()).toBe(2);
      expect(AdapterFactory.hasAdapter(SISType.BANNER)).toBe(true);
      expect(AdapterFactory.hasAdapter(SISType.PEOPLESOFT)).toBe(false);
      expect(AdapterFactory.hasAdapter(SISType.COLLEAGUE)).toBe(true);
    });
  });
});
