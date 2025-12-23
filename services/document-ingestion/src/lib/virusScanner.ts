export interface VirusScanResult {
  isClean: boolean;
  threats: string[];
  scanDuration: number;
}

export class VirusScanner {
  private static readonly SCAN_TIMEOUT = 30000;

  static async scanFile(fileBuffer: Buffer): Promise<VirusScanResult> {
    const startTime = Date.now();

    try {
      const result = await this.performScan(fileBuffer);
      const scanDuration = Date.now() - startTime;

      return {
        ...result,
        scanDuration,
      };
    } catch (error) {
      console.error("Virus scan error:", error);
      const scanDuration = Date.now() - startTime;

      return {
        isClean: false,
        threats: ["Scan failed"],
        scanDuration,
      };
    }
  }

  private static async performScan(
    fileBuffer: Buffer,
  ): Promise<VirusScanResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Virus scan timed out"));
      }, this.SCAN_TIMEOUT);

      try {
        setTimeout(() => {
          clearTimeout(timeout);

          const potentialThreats = this.analyzeFilePatterns(fileBuffer);

          resolve({
            isClean: potentialThreats.length === 0,
            threats: potentialThreats,
            scanDuration: 0,
          });
        }, 500);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private static analyzeFilePatterns(buffer: Buffer): string[] {
    const threats: string[] = [];
    const content = buffer.toString("binary", 0, Math.min(buffer.length, 1024));

    const suspiciousPatterns = [
      "MZ",
      "PK",
      "<script",
      "javascript:",
      "eval(",
      "base64_decode",
      "shell_exec",
      "passthru",
    ];

    suspiciousPatterns.forEach((pattern) => {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        threats.push(`Suspicious pattern detected: ${pattern}`);
      }
    });

    return threats;
  }
}
