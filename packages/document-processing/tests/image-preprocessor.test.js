const ImagePreprocessor = require("../src/image-preprocessor");
const sharp = require("sharp");

describe("ImagePreprocessor", () => {
  let preprocessor;
  let testImageBuffer;

  beforeAll(async () => {
    preprocessor = new ImagePreprocessor();

    // Create a test image (simple white image)
    testImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: "white",
      },
    })
      .png()
      .toBuffer();
  });

  describe("toGrayscale", () => {
    test("should convert image to grayscale", async () => {
      const result = await preprocessor.toGrayscale(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
      const metadata = await sharp(result).metadata();
      expect(metadata).toBeDefined();
    });

    test("should maintain image dimensions", async () => {
      const result = await preprocessor.toGrayscale(testImageBuffer);

      const originalMetadata = await sharp(testImageBuffer).metadata();
      const resultMetadata = await sharp(result).metadata();

      expect(resultMetadata.width).toBe(originalMetadata.width);
      expect(resultMetadata.height).toBe(originalMetadata.height);
    });

    test("should handle empty buffer", async () => {
      await expect(preprocessor.toGrayscale(Buffer.alloc(0))).rejects.toThrow();
    });
  });

  describe("increaseContrast", () => {
    test("should increase contrast", async () => {
      const result = await preprocessor.increaseContrast(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
      const metadata = await sharp(result).metadata();
      expect(metadata).toBeDefined();
    });

    test("should accept custom sigma", async () => {
      const result = await preprocessor.increaseContrast(testImageBuffer, 1.5);

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should maintain image dimensions", async () => {
      const result = await preprocessor.increaseContrast(testImageBuffer);

      const originalMetadata = await sharp(testImageBuffer).metadata();
      const resultMetadata = await sharp(result).metadata();

      expect(resultMetadata.width).toBe(originalMetadata.width);
      expect(resultMetadata.height).toBe(originalMetadata.height);
    });
  });

  describe("removeNoise", () => {
    test("should apply sharpening", async () => {
      const result = await preprocessor.removeNoise(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
      const metadata = await sharp(result).metadata();
      expect(metadata).toBeDefined();
    });

    test("should maintain image dimensions", async () => {
      const result = await preprocessor.removeNoise(testImageBuffer);

      const originalMetadata = await sharp(testImageBuffer).metadata();
      const resultMetadata = await sharp(result).metadata();

      expect(resultMetadata.width).toBe(originalMetadata.width);
      expect(resultMetadata.height).toBe(originalMetadata.height);
    });
  });

  describe("normalizeResolution", () => {
    test("should normalize resolution to target DPI", async () => {
      const result = await preprocessor.normalizeResolution(
        testImageBuffer,
        300,
      );

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should scale low DPI image", async () => {
      const lowDpiImage = await sharp(testImageBuffer)
        .withMetadata({ density: 72 })
        .png()
        .toBuffer();
      const result = await preprocessor.normalizeResolution(lowDpiImage, 300);

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should not scale if already at target DPI", async () => {
      const highDpiImage = await sharp(testImageBuffer)
        .withMetadata({ density: 300 })
        .png()
        .toBuffer();
      const result = await preprocessor.normalizeResolution(highDpiImage, 300);

      const originalMetadata = await sharp(highDpiImage).metadata();
      const resultMetadata = await sharp(result).metadata();

      expect(resultMetadata.width).toBe(originalMetadata.width);
      expect(resultMetadata.height).toBe(originalMetadata.height);
    });

    test("should accept custom target DPI", async () => {
      const result = await preprocessor.normalizeResolution(
        testImageBuffer,
        200,
      );

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("deskew", () => {
    test("should apply rotation correction", async () => {
      const result = await preprocessor.deskew(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should handle rotated image", async () => {
      const rotatedImage = await sharp(testImageBuffer)
        .rotate(5)
        .png()
        .toBuffer();
      const result = await preprocessor.deskew(rotatedImage);

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("cropToContent", () => {
    test("should crop to content", async () => {
      const result = await preprocessor.cropToContent(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("convertToPng", () => {
    test("should convert to PNG format", async () => {
      const result = await preprocessor.convertToPng(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("png");
    });

    test("should convert JPEG to PNG", async () => {
      const jpegImage = await sharp(testImageBuffer).jpeg().toBuffer();
      const result = await preprocessor.convertToPng(jpegImage);

      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("png");
    });
  });

  describe("preprocess - Full Pipeline", () => {
    test("should apply full pipeline with default options", async () => {
      const result = await preprocessor.preprocess(testImageBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe("png");
    });

    test("should apply all preprocessing steps when enabled", async () => {
      const result = await preprocessor.preprocess(testImageBuffer, {
        grayscale: true,
        normalizeResolution: true,
        crop: true,
        deskew: true,
        removeNoise: true,
        increaseContrast: true,
        convertToPng: true,
      });

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should allow disabling individual steps", async () => {
      const result = await preprocessor.preprocess(testImageBuffer, {
        grayscale: false,
        normalizeResolution: false,
        crop: false,
        deskew: false,
        removeNoise: false,
        increaseContrast: false,
        convertToPng: false,
      });

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should use custom target DPI", async () => {
      const result = await preprocessor.preprocess(testImageBuffer, {
        targetDPI: 200,
      });

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should complete within reasonable time", async () => {
      const startTime = Date.now();
      await preprocessor.preprocess(testImageBuffer);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000);
    });
  });

  describe("getMetadata", () => {
    test("should return image metadata", async () => {
      const metadata = await preprocessor.getMetadata(testImageBuffer);

      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty("width");
      expect(metadata).toHaveProperty("height");
      expect(metadata).toHaveProperty("format");
      expect(metadata).toHaveProperty("channels");
    });

    test("should return correct dimensions", async () => {
      const metadata = await preprocessor.getMetadata(testImageBuffer);

      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
    });

    test("should return format", async () => {
      const metadata = await preprocessor.getMetadata(testImageBuffer);

      expect(metadata.format).toBe("png");
    });

    test("should handle invalid buffer", async () => {
      await expect(
        preprocessor.getMetadata(Buffer.from("invalid")),
      ).rejects.toThrow();
    });
  });

  describe("validateForOcr", () => {
    test("should validate suitable image", async () => {
      const validation = await preprocessor.validateForOcr(testImageBuffer);

      expect(validation).toHaveProperty("valid");
      expect(validation).toHaveProperty("issues");
      expect(validation).toHaveProperty("warnings");
      expect(validation).toHaveProperty("metadata");
    });

    test("should warn about low DPI", async () => {
      const lowDpiImage = await sharp(testImageBuffer)
        .withMetadata({ density: 100 })
        .png()
        .toBuffer();
      const validation = await preprocessor.validateForOcr(lowDpiImage);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some((w) => w.includes("Low DPI"))).toBe(true);
    });

    test("should warn about lossy format", async () => {
      const jpegImage = await sharp(testImageBuffer).jpeg().toBuffer();
      const validation = await preprocessor.validateForOcr(jpegImage);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some((w) => w.includes("Lossy"))).toBe(true);
    });

    test("should reject too small image", async () => {
      const smallImage = await sharp({
        create: { width: 100, height: 100, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();
      const validation = await preprocessor.validateForOcr(smallImage);

      expect(validation.valid).toBe(false);
      expect(validation.issues.some((i) => i.includes("too small"))).toBe(true);
    });

    test("should include metadata in validation", async () => {
      const validation = await preprocessor.validateForOcr(testImageBuffer);

      expect(validation.metadata).toBeDefined();
      expect(validation.metadata.width).toBe(800);
      expect(validation.metadata.height).toBe(600);
    });

    test("should handle invalid buffer", async () => {
      const validation = await preprocessor.validateForOcr(
        Buffer.from("invalid"),
      );

      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty buffer in preprocess", async () => {
      await expect(preprocessor.preprocess(Buffer.alloc(0))).rejects.toThrow();
    });

    test("should handle very small image in preprocess", async () => {
      const smallImage = await sharp({
        create: { width: 50, height: 50, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();

      const result = await preprocessor.preprocess(smallImage);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test("should handle all-black image", async () => {
      const blackImage = await sharp({
        create: { width: 800, height: 600, channels: 3, background: "black" },
      })
        .png()
        .toBuffer();

      const validation = await preprocessor.validateForOcr(blackImage);
      expect(validation).toBeDefined();
    });

    test("should handle all-white image", async () => {
      const whiteImage = await sharp({
        create: { width: 800, height: 600, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();

      const validation = await preprocessor.validateForOcr(whiteImage);
      expect(validation).toBeDefined();
    });
  });

  describe("Performance Tests", () => {
    test("should preprocess image within 30 seconds", async () => {
      const startTime = Date.now();
      await preprocessor.preprocess(testImageBuffer);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000);
    });

    test("should process multiple images efficiently", async () => {
      const images = [];
      for (let i = 0; i < 5; i++) {
        const img = await sharp({
          create: { width: 800, height: 600, channels: 3, background: "white" },
        })
          .png()
          .toBuffer();
        images.push(img);
      }

      const startTime = Date.now();
      for (const img of images) {
        await preprocessor.preprocess(img);
      }
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(60000);
    });
  });
});
