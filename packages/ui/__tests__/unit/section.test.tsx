/**
 * Section Component Unit Tests
 *
 * Comprehensive unit tests for Section component covering:
 * - Rendering with default props
 * - MaxWidth options
 * - Centered option
 * - Custom className and props
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "@/components/section";

describe("Section Component", () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Section>Section content</Section>);
      const section = screen.getByText("Section content");
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass("w-full", "mx-auto", "max-w-lg");
    });

    it("should render with custom children", () => {
      render(
        <Section>
          <h1>Heading</h1>
          <p>Content</p>
        </Section>,
      );
      expect(screen.getByText("Heading")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Section className="custom-section">Content</Section>);
      const section = screen.getByText("Content");
      expect(section).toHaveClass("custom-section");
    });

    it("should render with additional HTML attributes", () => {
      render(
        <Section id="test-section" aria-label="Test">
          Content
        </Section>,
      );
      const section = screen.getByText("Content");
      expect(section).toHaveAttribute("id", "test-section");
      expect(section).toHaveAttribute("aria-label", "Test");
    });

    it("should be a section element", () => {
      render(<Section>Content</Section>);
      const section = screen.getByText("Content").closest("section");
      expect(section).toBeInTheDocument();
    });
  });

  // ============================================================================
  // MaxWidth Tests
  // ============================================================================

  describe("MaxWidth", () => {
    it("should render with xs maxWidth", () => {
      render(<Section maxWidth="xs">Extra Small</Section>);
      const section = screen.getByText("Extra Small");
      expect(section).toHaveClass("max-w-xs");
    });

    it("should render with sm maxWidth", () => {
      render(<Section maxWidth="sm">Small</Section>);
      const section = screen.getByText("Small");
      expect(section).toHaveClass("max-w-sm");
    });

    it("should render with md maxWidth", () => {
      render(<Section maxWidth="md">Medium</Section>);
      const section = screen.getByText("Medium");
      expect(section).toHaveClass("max-w-md");
    });

    it("should render with lg maxWidth", () => {
      render(<Section maxWidth="lg">Large</Section>);
      const section = screen.getByText("Large");
      expect(section).toHaveClass("max-w-lg");
    });

    it("should render with xl maxWidth", () => {
      render(<Section maxWidth="xl">Extra Large</Section>);
      const section = screen.getByText("Extra Large");
      expect(section).toHaveClass("max-w-xl");
    });

    it("should render with 2xl maxWidth", () => {
      render(<Section maxWidth="2xl">2XL</Section>);
      const section = screen.getByText("2XL");
      expect(section).toHaveClass("max-w-2xl");
    });

    it("should render with 3xl maxWidth", () => {
      render(<Section maxWidth="3xl">3XL</Section>);
      const section = screen.getByText("3XL");
      expect(section).toHaveClass("max-w-3xl");
    });

    it("should render with 4xl maxWidth", () => {
      render(<Section maxWidth="4xl">4XL</Section>);
      const section = screen.getByText("4XL");
      expect(section).toHaveClass("max-w-4xl");
    });

    it("should render with 5xl maxWidth", () => {
      render(<Section maxWidth="5xl">5XL</Section>);
      const section = screen.getByText("5XL");
      expect(section).toHaveClass("max-w-5xl");
    });

    it("should render with 6xl maxWidth", () => {
      render(<Section maxWidth="6xl">6XL</Section>);
      const section = screen.getByText("6XL");
      expect(section).toHaveClass("max-w-6xl");
    });

    it("should render with 7xl maxWidth", () => {
      render(<Section maxWidth="7xl">7XL</Section>);
      const section = screen.getByText("7XL");
      expect(section).toHaveClass("max-w-7xl");
    });

    it("should render with full maxWidth", () => {
      render(<Section maxWidth="full">Full Width</Section>);
      const section = screen.getByText("Full Width");
      expect(section).toHaveClass("max-w-full");
    });

    it("should default to lg maxWidth", () => {
      render(<Section>Default</Section>);
      const section = screen.getByText("Default");
      expect(section).toHaveClass("max-w-lg");
    });
  });

  // ============================================================================
  // Centered Tests
  // ============================================================================

  describe("Centered", () => {
    it("should render with centered prop true", () => {
      render(<Section centered={true}>Centered</Section>);
      const section = screen.getByText("Centered");
      expect(section).toHaveClass("mx-auto");
    });

    it("should render with centered prop false", () => {
      render(<Section centered={false}>Not Centered</Section>);
      const section = screen.getByText("Not Centered");
      expect(section).not.toHaveClass("mx-auto");
    });

    it("should default to centered true", () => {
      render(<Section>Default</Section>);
      const section = screen.getByText("Default");
      expect(section).toHaveClass("mx-auto");
    });
  });

  // ============================================================================
  // Combination Tests
  // ============================================================================

  describe("Combinations", () => {
    it("should render with maxWidth and centered combined", () => {
      render(
        <Section maxWidth="xl" centered={true}>
          Combined
        </Section>,
      );
      const section = screen.getByText("Combined");
      expect(section).toHaveClass("max-w-xl", "mx-auto");
    });

    it("should render with maxWidth and not centered", () => {
      render(
        <Section maxWidth="2xl" centered={false}>
          Not Centered
        </Section>,
      );
      const section = screen.getByText("Not Centered");
      expect(section).toHaveClass("max-w-2xl");
      expect(section).not.toHaveClass("mx-auto");
    });

    it("should render with all props combined", () => {
      render(
        <Section maxWidth="4xl" centered={true} className="custom">
          All Props
        </Section>,
      );
      const section = screen.getByText("All Props");
      expect(section).toHaveClass("max-w-4xl", "mx-auto", "custom");
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty children", () => {
      render(<Section></Section>);
      const section = screen.getByRole("region");
      expect(section).toBeInTheDocument();
    });

    it("should render with single child", () => {
      render(<Section>Single</Section>);
      expect(screen.getByText("Single")).toBeInTheDocument();
    });

    it("should render with many children", () => {
      render(
        <Section>
          {Array.from({ length: 100 }, (_, i) => (
            <p key={i}>Paragraph {i}</p>
          ))}
        </Section>,
      );
      expect(screen.getByText("Paragraph 0")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 99")).toBeInTheDocument();
    });

    it("should render with nested elements", () => {
      render(
        <Section>
          <div>
            <div>
              <span>Nested</span>
            </div>
          </div>
        </Section>,
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
    });

    it("should render with long content", () => {
      const longContent = "A".repeat(1000);
      render(<Section>{longContent}</Section>);
      const section = screen.getByText(longContent);
      expect(section).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Section>Section</Section>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all maxWidth options", () => {
      const maxWidths = [
        "xs",
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
        "7xl",
        "full",
      ] as const;
      maxWidths.forEach((maxWidth) => {
        const { container } = render(
          <Section maxWidth={maxWidth}>{maxWidth}</Section>,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
