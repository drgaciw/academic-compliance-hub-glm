/**
 * Container Component Unit Tests
 *
 * Comprehensive unit tests for Container component covering:
 * - Rendering with default props
 * - Padding options
 * - Custom className and props
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "@/components/container";

describe("Container Component", () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Container>Container content</Container>);
      const container = screen.getByText("Container content");
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("w-full", "p-6");
    });

    it("should render with custom children", () => {
      render(
        <Container>
          <h1>Heading</h1>
          <p>Content</p>
        </Container>,
      );
      expect(screen.getByText("Heading")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Container className="custom-container">Content</Container>);
      const container = screen.getByText("Content");
      expect(container).toHaveClass("custom-container");
    });

    it("should render with additional HTML attributes", () => {
      render(
        <Container id="test-container" aria-label="Test">
          Content
        </Container>,
      );
      const container = screen.getByText("Content");
      expect(container).toHaveAttribute("id", "test-container");
      expect(container).toHaveAttribute("aria-label", "Test");
    });

    it("should be a div element", () => {
      render(<Container>Content</Container>);
      const container = screen.getByText("Content").closest("div");
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Padding Tests
  // ============================================================================

  describe("Padding", () => {
    it("should render with none padding", () => {
      render(<Container padding="none">None</Container>);
      const container = screen.getByText("None");
      expect(container).toHaveClass("p-0");
    });

    it("should render with xs padding", () => {
      render(<Container padding="xs">Extra Small</Container>);
      const container = screen.getByText("Extra Small");
      expect(container).toHaveClass("p-2");
    });

    it("should render with sm padding", () => {
      render(<Container padding="sm">Small</Container>);
      const container = screen.getByText("Small");
      expect(container).toHaveClass("p-4");
    });

    it("should render with md padding", () => {
      render(<Container padding="md">Medium</Container>);
      const container = screen.getByText("Medium");
      expect(container).toHaveClass("p-6");
    });

    it("should render with lg padding", () => {
      render(<Container padding="lg">Large</Container>);
      const container = screen.getByText("Large");
      expect(container).toHaveClass("p-8");
    });

    it("should render with xl padding", () => {
      render(<Container padding="xl">Extra Large</Container>);
      const container = screen.getByText("Extra Large");
      expect(container).toHaveClass("p-12");
    });

    it("should default to md padding", () => {
      render(<Container>Default</Container>);
      const container = screen.getByText("Default");
      expect(container).toHaveClass("p-6");
    });
  });

  // ============================================================================
  // Combination Tests
  // ============================================================================

  describe("Combinations", () => {
    it("should render with padding and className combined", () => {
      render(
        <Container padding="lg" className="custom">
          Combined
        </Container>,
      );
      const container = screen.getByText("Combined");
      expect(container).toHaveClass("p-8", "custom");
    });

    it("should render with all props combined", () => {
      render(
        <Container padding="xl" className="custom" id="test">
          All Props
        </Container>,
      );
      const container = screen.getByText("All Props");
      expect(container).toHaveClass("p-12", "custom");
      expect(container).toHaveAttribute("id", "test");
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty children", () => {
      render(<Container></Container>);
      const container = screen.getByRole("generic");
      expect(container).toBeInTheDocument();
    });

    it("should render with single child", () => {
      render(<Container>Single</Container>);
      expect(screen.getByText("Single")).toBeInTheDocument();
    });

    it("should render with many children", () => {
      render(
        <Container>
          {Array.from({ length: 100 }, (_, i) => (
            <p key={i}>Paragraph {i}</p>
          ))}
        </Container>,
      );
      expect(screen.getByText("Paragraph 0")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 99")).toBeInTheDocument();
    });

    it("should render with nested elements", () => {
      render(
        <Container>
          <div>
            <div>
              <span>Nested</span>
            </div>
          </div>
        </Container>,
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
    });

    it("should render with long content", () => {
      const longContent = "A".repeat(1000);
      render(<Container>{longContent}</Container>);
      const container = screen.getByText(longContent);
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Container>Container</Container>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all padding options", () => {
      const paddings = ["none", "xs", "sm", "md", "lg", "xl"] as const;
      paddings.forEach((padding) => {
        const { container } = render(
          <Container padding={padding}>{padding}</Container>,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
