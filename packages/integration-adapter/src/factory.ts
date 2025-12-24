import { SISAdapter, SISType, SISCredentials, AdapterConfig } from "./index";
import { BannerAdapter } from "./banner-adapter";
import { PeopleSoftAdapter } from "./peoplesoft-adapter";
import { ColleagueAdapter } from "./colleague-adapter";
import { CustomRestAdapter } from "./custom-rest-adapter";
import type { CustomRestAdapterConfig } from "./custom-rest-adapter";
import { SFTPAdapter } from "./sftp-adapter";
import type { SFTPAdapterConfig } from "./sftp-adapter";

interface AdapterInstance {
  adapter: SISAdapter;
  createdAt: Date;
  lastUsedAt: Date;
}

class AdapterFactoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AdapterFactoryError";
  }
}

export class AdapterFactory {
  private static instances = new Map<SISType, AdapterInstance>();
  private static config: AdapterConfig = {};
  private static cleanupIntervalMs = 30 * 60 * 1000;
  private static cleanupTimer?: NodeJS.Timeout;

  static initialize(config: AdapterConfig = {}): void {
    this.config = config;

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleAdapters();
    }, this.cleanupIntervalMs);
  }

  static shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.instances.clear();
  }

  static getAdapter(sisType: SISType, config?: AdapterConfig): SISAdapter {
    if (!Object.values(SISType).includes(sisType)) {
      throw new AdapterFactoryError(
        `Unknown SIS type: ${sisType}`,
        "UNKNOWN_SIS_TYPE",
      );
    }

    const mergedConfig = { ...this.config, ...config };

    let instance = this.instances.get(sisType);

    if (!instance) {
      instance = this.createAdapter(sisType, mergedConfig);
      this.instances.set(sisType, instance);
    }

    instance.lastUsedAt = new Date();
    return instance.adapter;
  }

  static async getAdapterWithCredentials(
    sisType: SISType,
    credentials: SISCredentials,
    config?: AdapterConfig,
  ): Promise<{ adapter: SISAdapter; session: any }> {
    const adapter = this.getAdapter(sisType, config);
    const session = await adapter.authenticate(credentials);
    return { adapter, session };
  }

  private static createAdapter(
    sisType: SISType,
    config: AdapterConfig,
  ): AdapterInstance {
    let adapter: SISAdapter;

    switch (sisType) {
      case SISType.BANNER:
        adapter = new BannerAdapter(config);
        break;

      case SISType.PEOPLESOFT:
        adapter = new PeopleSoftAdapter(config);
        break;

      case SISType.COLLEAGUE:
        adapter = new ColleagueAdapter(config);
        break;

      case SISType.CUSTOM:
        if ((config as CustomRestAdapterConfig).endpoints) {
          adapter = new CustomRestAdapter(config as CustomRestAdapterConfig);
        } else if ((config as SFTPAdapterConfig).baseDirectory !== undefined) {
          adapter = new SFTPAdapter(config as SFTPAdapterConfig);
        } else {
          adapter = new CustomRestAdapter(config);
        }
        break;

      case SISType.JICS:
      case SISType.WORKDAY:
        adapter = new CustomRestAdapter(config);
        break;

      default:
        throw new AdapterFactoryError(
          `Unsupported SIS type: ${sisType}`,
          "UNSUPPORTED_SIS_TYPE",
        );
    }

    return {
      adapter,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
  }

  static removeAdapter(sisType: SISType): boolean {
    return this.instances.delete(sisType);
  }

  static clearAllAdapters(): void {
    this.instances.clear();
  }

  static getActiveAdapters(): SISType[] {
    return Array.from(this.instances.keys());
  }

  static getAdapterCount(): number {
    return this.instances.size;
  }

  static hasAdapter(sisType: SISType): boolean {
    return this.instances.has(sisType);
  }

  static getAdapterInfo(sisType: SISType): AdapterInstance | undefined {
    const instance = this.instances.get(sisType);
    if (!instance) return undefined;

    return {
      adapter: instance.adapter,
      createdAt: instance.createdAt,
      lastUsedAt: instance.lastUsedAt,
    };
  }

  static refreshAdapter(sisType: SISType, config?: AdapterConfig): SISAdapter {
    this.removeAdapter(sisType);
    return this.getAdapter(sisType, config);
  }

  static isSupported(sisType: SISType): boolean {
    return [
      SISType.BANNER,
      SISType.PEOPLESOFT,
      SISType.COLLEAGUE,
      SISType.CUSTOM,
      SISType.JICS,
      SISType.WORKDAY,
    ].includes(sisType);
  }

  static getSupportedTypes(): SISType[] {
    return [
      SISType.BANNER,
      SISType.PEOPLESOFT,
      SISType.COLLEAGUE,
      SISType.CUSTOM,
      SISType.JICS,
      SISType.WORKDAY,
    ];
  }

  private static cleanupIdleAdapters(): void {
    const now = new Date();
    const idleThreshold = 60 * 60 * 1000;

    for (const [sisType, instance] of this.instances.entries()) {
      const idleTime = now.getTime() - instance.lastUsedAt.getTime();
      if (idleTime > idleThreshold) {
        this.instances.delete(sisType);
      }
    }
  }

  static setCleanupInterval(intervalMs: number): void {
    this.cleanupIntervalMs = intervalMs;
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = setInterval(() => {
        this.cleanupIdleAdapters();
      }, this.cleanupIntervalMs);
    }
  }
}

export function getAdapter(
  sisType: SISType,
  config?: AdapterConfig,
): SISAdapter {
  return AdapterFactory.getAdapter(sisType, config);
}

export {
  BannerAdapter,
  PeopleSoftAdapter,
  ColleagueAdapter,
  CustomRestAdapter,
  SFTPAdapter,
};
