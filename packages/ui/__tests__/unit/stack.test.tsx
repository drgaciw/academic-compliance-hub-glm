/**
 * Stack Component Unit Tests
 *
 * Comprehensive unit tests for the Stack component covering:
 * - Rendering with default props
 * - Rendering with direction variants (row, col)
 * - Alignment options (start, center, end, stretch)
 * - Justify options (start, center, end, between, around)
 * - Gap options
 * - Custom className and props
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stack } from "@/components/stack";

describe("Stack Component", () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Stack>Stack content</Stack>);
      const stack = screen.getByText("Stack content");
      expect(stack).toBeInTheDocument();
      expect(stack).toHaveClass(
        "flex",
        "flex-col",
        "items-stretch",
        "justify-start",
        "gap-0",
      );
    });

    it("should render with custom children", () => {
      render(
        <Stack>
          <span>Item 1</span>
          <span>Item 2</span>
        </Stack>,
      );
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Stack className="custom-stack">Content</Stack>);
      const stack = screen.getByText("Content");
      expect(stack).toHaveClass("custom-stack");
    });

    it("should render with additional HTML attributes", () => {
      render(
        <Stack data-testid="stack" id="test-stack">
          Content
        </Stack>,
      );
      const stack = screen.getByTestId("stack");
      expect(stack).toHaveAttribute("id", "test-stack");
    });
  });

  // ============================================================================
  // Direction Tests
  // ============================================================================

  describe("Direction", () => {
    it("should render with row direction", () => {
      render(<Stack direction="row">Row</Stack>);
      const stack = screen.getByText("Row");
      expect(stack).toHaveClass("flex-row");
      expect(stack).not.toHaveClass("flex-col");
    });

    it("should render with col direction", () => {
      render(<Stack direction="col">Column</Stack>);
      const stack = screen.getByText("Column");
      expect(stack).toHaveClass("flex-col");
      expect(stack).not.toHaveClass("flex-row");
    });

    it("should default to col direction", () => {
      render(<Stack>Default</Stack>);
      const stack = screen.getByText("Default");
      expect(stack).toHaveClass("flex-col");
    });
  });

  // ============================================================================
  // Alignment Tests
  // ============================================================================

  describe("Alignment", () => {
    it("should render with start alignment", () => {
      render(<Stack align="start">Start</Stack>);
      const stack = screen.getByText("Start");
      expect(stack).toHaveClass("items-start");
    });

    it("should render with center alignment", () => {
      render(<Stack align="center">Center</Stack>);
      const stack = screen.getByText("Center");
      expect(stack).toHaveClass("items-center");
    });

    it("should render with end alignment", () => {
      render(<Stack align="end">End</Stack>);
      const stack = screen.getByText("End");
      expect(stack).toHaveClass("items-end");
    });

    it("should render with stretch alignment", () => {
      render(<Stack align="stretch">Stretch</Stack>);
      const stack = screen.getByText("Stretch");
      expect(stack).toHaveClass("items-stretch");
    });

    it("should default to stretch alignment", () => {
      render(<Stack>Default</Stack>);
      const stack = screen.getByText("Default");
      expect(stack).toHaveClass("items-stretch");
    });
  });

  // ============================================================================
  // Justify Tests
  // ============================================================================

  describe("Justify", () => {
    it("should render with start justify", () => {
      render(<Stack justify="start">Start</Stack>);
      const stack = screen.getByText("Start");
      expect(stack).toHaveClass("justify-start");
    });

    it("should render with center justify", () => {
      render(<Stack justify="center">Center</Stack>);
      const stack = screen.getByText("Center");
      expect(stack).toHaveClass("justify-center");
    });

    it("should render with end justify", () => {
      render(<Stack justify="end">End</Stack>);
      const stack = screen.getByText("End");
      expect(stack).toHaveClass("justify-end");
    });

    it("should render with between justify", () => {
      render(<Stack justify="between">Between</Stack>);
      const stack = screen.getByText("Between");
      expect(stack).toHaveClass("justify-between");
    });

    it("should render with around justify", () => {
      render(<Stack justify="around">Around</Stack>);
      const stack = screen.getByText("Around");
      expect(stack).toHaveClass("justify-around");
    });

    it("should default to start justify", () => {
      render(<Stack>Default</Stack>);
      const stack = screen.getByText("Default");
      expect(stack).toHaveClass("justify-start");
    });
  });

  // ============================================================================
  // Gap Tests
  // ============================================================================

  describe("Gap", () => {
    it("should render with gap-0", () => {
      render(<Stack gap={0}>Gap 0</Stack>);
      const stack = screen.getByText("Gap 0");
      expect(stack).toHaveClass("gap-0");
    });

    it("should render with gap-1", () => {
      render(<Stack gap={1}>Gap 1</Stack>);
      const stack = screen.getByText("Gap 1");
      expect(stack).toHaveClass("gap-1");
    });

    it("should render with gap-2", () => {
      render(<Stack gap={2}>Gap 2</Stack>);
      const stack = screen.getByText("Gap 2");
      expect(stack).toHaveClass("gap-2");
    });

    it("should render with gap-3", () => {
      render(<Stack gap={3}>Gap 3</Stack>);
      const stack = screen.getByText("Gap 3");
      expect(stack).toHaveClass("gap-3");
    });

    it("should render with gap-4", () => {
      render(<Stack gap={4}>Gap 4</Stack>);
      const stack = screen.getByText("Gap 4");
      expect(stack).toHaveClass("gap-4");
    });

    it("should render with gap-5", () => {
      render(<Stack gap={5}>Gap 5</Stack>);
      const stack = screen.getByText("Gap 5");
      expect(stack).toHaveClass("gap-5");
    });

    it("should render with gap-6", () => {
      render(<Stack gap={6}>Gap 6</Stack>);
      const stack = screen.getByText("Gap 6");
      expect(stack).toHaveClass("gap-6");
    });

    it("should render with gap-8", () => {
      render(<Stack gap={8}>Gap 8</Stack>);
      const stack = screen.getByText("Gap 8");
      expect(stack).toHaveClass("gap-8");
    });

    it("should render with gap-10", () => {
      render(<Stack gap={10}>Gap 10</Stack>);
      const stack = screen.getByText("Gap 10");
      expect(stack).toHaveClass("gap-10");
    });

    it("should render with gap-12", () => {
      render(<Stack gap={12}>Gap 12</Stack>);
      const stack = screen.getByText("Gap 12");
      expect(stack).toHaveClass("gap-12");
    });

    it("should render with gap-16", () => {
      render(<Stack gap={16}>Gap 16</Stack>);
      const stack = screen.getByText("Gap 16");
      expect(stack).toHaveClass("gap-16");
    });

    it("should default to gap-0", () => {
      render(<Stack>Default</Stack>);
      const stack = screen.getByText("Default");
      expect(stack).toHaveClass("gap-0");
    });
  });

  // ============================================================================
  // Combination Tests
  // ============================================================================

  describe("Combinations", () => {
    it("should render with row direction and center alignment", () => {
      render(
        <Stack direction="row" align="center">
          Combined
        </Stack>,
      );
      const stack = screen.getByText("Combined");
      expect(stack).toHaveClass("flex-row", "items-center");
    });

    it("should render with col direction and between justify", () => {
      render(
        <Stack direction="col" justify="between">
          Combined
        </Stack>,
      );
      const stack = screen.getByText("Combined");
      expect(stack).toHaveClass("flex-col", "justify-between");
    });

    it("should render with all props combined", () => {
      render(
        <Stack
          direction="row"
          align="center"
          justify="between"
          gap={4}
          className="custom"
        >
          All Props
        </Stack>,
      );
      const stack = screen.getByText("All Props");
      expect(stack).toHaveClass(
        "flex-row",
        "items-center",
        "justify-between",
        "gap-4",
        "custom",
      );
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty children", () => {
      render(<Stack></Stack>);
      const stack = screen.getByRole("generic");
      expect(stack).toBeInTheDocument();
    });

    it("should render with single child", () => {
      render(<Stack>Single</Stack>);
      expect(screen.getByText("Single")).toBeInTheDocument();
    });

    it("should render with many children", () => {
      render(
        <Stack>
          {Array.from({ length: 100 }, (_, i) => (
            <span key={i}>Item {i}</span>
          ))}
        </Stack>,
      );
      expect(screen.getByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 99")).toBeInTheDocument();
    });

    it("should render with nested elements", () => {
      render(
        <Stack>
          <div>
            <span>Nested</span>
          </div>
        </Stack>,
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Stack>Stack</Stack>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all directions", () => {
      const directions = ["row", "col"] as const;
      directions.forEach((direction) => {
        const { container } = render(
          <Stack direction={direction}>{direction}</Stack>,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
