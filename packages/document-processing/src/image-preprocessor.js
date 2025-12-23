const sharp = require("sharp");

/**
 * Image Preprocessing for OCR
 * Improves OCR accuracy by preparing images
 */
class ImagePreprocessor {
  /**
   * Apply grayscale conversion
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async toGrayscale(imageBuffer) {
    return sharp(imageBuffer).grayscale().toBuffer();
  }

  /**
   * Increase contrast for better OCR
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {number} sigma - Contrast adjustment (default: 1.0)
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async increaseContrast(imageBuffer, sigma = 1.0) {
    return sharp(imageBuffer).linear(1.5, -50).toBuffer();
  }

  /**
   * Remove noise from image
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async removeNoise(imageBuffer) {
    return sharp(imageBuffer).sharpen().toBuffer();
  }

  /**
   * Resize image to optimal DPI (300 DPI recommended for OCR)
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {number} targetDPI - Target DPI (default: 300)
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async normalizeResolution(imageBuffer, targetDPI = 300) {
    const metadata = await sharp(imageBuffer).metadata();
    const scaleFactor = targetDPI / (metadata.density || 72);

    if (scaleFactor <= 1) {
      return imageBuffer;
    }

    return sharp(imageBuffer)
      .resize({
        width: Math.round(metadata.width * scaleFactor),
        height: Math.round(metadata.height * scaleFactor),
        fit: "inside",
      })
      .toBuffer();
  }

  /**
   * Apply deskewing (rotation correction)
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async deskew(imageBuffer) {
    return sharp(imageBuffer).rotate().toBuffer();
  }

  /**
   * Crop image to content
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async cropToContent(imageBuffer) {
    return sharp(imageBuffer).trim().toBuffer();
  }

  /**
   * Convert to PNG format (best for OCR)
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async convertToPng(imageBuffer) {
    return sharp(imageBuffer)
      .png({
        compressionLevel: 0,
        adaptiveFiltering: false,
        palette: true,
      })
      .toBuffer();
  }

  /**
   * Apply full preprocessing pipeline
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {object} options - Preprocessing options
   * @returns {Promise<Buffer>} - Fully processed image buffer
   */
  async preprocess(imageBuffer, options = {}) {
    const {
      grayscale = true,
      normalizeResolution = true,
      targetDPI = 300,
      crop = true,
      deskew = true,
      removeNoise = true,
      increaseContrast = true,
      convertToPng = true,
    } = options;

    let processed = imageBuffer;

    if (grayscale) {
      processed = await this.toGrayscale(processed);
    }

    if (normalizeResolution) {
      processed = await this.normalizeResolution(processed, targetDPI);
    }

    if (crop) {
      processed = await this.cropToContent(processed);
    }

    if (deskew) {
      processed = await this.deskew(processed);
    }

    if (removeNoise) {
      processed = await this.removeNoise(processed);
    }

    if (increaseContrast) {
      processed = await this.increaseContrast(processed);
    }

    if (convertToPng) {
      processed = await this.convertToPng(processed);
    }

    return processed;
  }

  /**
   * Get image metadata
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<object>} - Image metadata
   */
  async getMetadata(imageBuffer) {
    return sharp(imageBuffer).metadata();
  }

  /**
   * Validate image is suitable for OCR
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Promise<object>} - Validation result
   */
  async validateForOcr(imageBuffer) {
    try {
      const metadata = await this.getMetadata(imageBuffer);

      const issues = [];
      const warnings = [];

      // Check DPI
      if (!metadata.density || metadata.density < 200) {
        warnings.push(
          `Low DPI: ${metadata.density || "unknown"} (recommended: 300+)`,
        );
      }

      // Check dimensions
      if (metadata.width < 500 || metadata.height < 500) {
        issues.push("Image too small for reliable OCR");
      }

      // Check format
      const lossyFormats = ["jpeg", "jpg"];
      if (
        metadata.format &&
        lossyFormats.includes(metadata.format.toLowerCase())
      ) {
        warnings.push("Lossy compression detected; consider PNG");
      }

      return {
        valid: issues.length === 0,
        issues,
        warnings,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          dpi: metadata.density,
          hasAlpha: metadata.hasAlpha,
        },
      };
    } catch (error) {
      return {
        valid: false,
        issues: [error.message],
        warnings: [],
        metadata: null,
      };
    }
  }
}

module.exports = ImagePreprocessor;
