/**
 * Grid Component Unit Tests
 *
 * Comprehensive unit tests for Grid component covering:
 * - Rendering with default props
 * - Column variants (1-12)
 * - Responsive breakpoints (sm, md, lg, xl)
 * - Gap options
 * - Alignment options
 * - Custom className and props
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Grid } from "@/components/grid";

describe("Grid Component", () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Grid>Grid content</Grid>);
      const grid = screen.getByText("Grid content");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass("grid", "grid-cols-1", "gap-4", "items-stretch");
    });

    it("should render with custom children", () => {
      render(
        <Grid>
          <span>Item 1</span>
          <span>Item 2</span>
        </Grid>,
      );
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Grid className="custom-grid">Content</Grid>);
      const grid = screen.getByText("Content");
      expect(grid).toHaveClass("custom-grid");
    });

    it("should render with additional HTML attributes", () => {
      render(
        <Grid data-testid="grid" id="test-grid">
          Content
        </Grid>,
      );
      const grid = screen.getByTestId("grid");
      expect(grid).toHaveAttribute("id", "test-grid");
    });
  });

  // ============================================================================
  // Columns Tests
  // ============================================================================

  describe("Columns", () => {
    it("should render with 1 column", () => {
      render(<Grid cols={1}>1 col</Grid>);
      const grid = screen.getByText("1 col");
      expect(grid).toHaveClass("grid-cols-1");
    });

    it("should render with 2 columns", () => {
      render(<Grid cols={2}>2 cols</Grid>);
      const grid = screen.getByText("2 cols");
      expect(grid).toHaveClass("grid-cols-2");
    });

    it("should render with 3 columns", () => {
      render(<Grid cols={3}>3 cols</Grid>);
      const grid = screen.getByText("3 cols");
      expect(grid).toHaveClass("grid-cols-3");
    });

    it("should render with 4 columns", () => {
      render(<Grid cols={4}>4 cols</Grid>);
      const grid = screen.getByText("4 cols");
      expect(grid).toHaveClass("grid-cols-4");
    });

    it("should render with 6 columns", () => {
      render(<Grid cols={6}>6 cols</Grid>);
      const grid = screen.getByText("6 cols");
      expect(grid).toHaveClass("grid-cols-6");
    });

    it("should render with 12 columns", () => {
      render(<Grid cols={12}>12 cols</Grid>);
      const grid = screen.getByText("12 cols");
      expect(grid).toHaveClass("grid-cols-12");
    });

    it("should default to 1 column", () => {
      render(<Grid>Default</Grid>);
      const grid = screen.getByText("Default");
      expect(grid).toHaveClass("grid-cols-1");
    });
  });

  // ============================================================================
  // Responsive Breakpoints Tests
  // ============================================================================

  describe("Responsive Breakpoints", () => {
    it("should render with sm breakpoint", () => {
      render(<Grid sm={2}>sm: 2 cols</Grid>);
      const grid = screen.getByText("sm: 2 cols");
      expect(grid).toHaveClass("sm:grid-cols-2");
    });

    it("should render with md breakpoint", () => {
      render(<Grid md={3}>md: 3 cols</Grid>);
      const grid = screen.getByText("md: 3 cols");
      expect(grid).toHaveClass("md:grid-cols-3");
    });

    it("should render with lg breakpoint", () => {
      render(<Grid lg={4}>lg: 4 cols</Grid>);
      const grid = screen.getByText("lg: 4 cols");
      expect(grid).toHaveClass("lg:grid-cols-4");
    });

    it("should render with xl breakpoint", () => {
      render(<Grid xl={6}>xl: 6 cols</Grid>);
      const grid = screen.getByText("xl: 6 cols");
      expect(grid).toHaveClass("xl:grid-cols-6");
    });

    it("should render with all breakpoints combined", () => {
      render(
        <Grid cols={1} sm={2} md={3} lg={4} xl={6}>
          All breakpoints
        </Grid>,
      );
      const grid = screen.getByText("All breakpoints");
      expect(grid).toHaveClass(
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-6",
      );
    });
  });

  // ============================================================================
  // Gap Tests
  // ============================================================================

  describe("Gap", () => {
    it("should render with gap-0", () => {
      render(<Grid gap={0}>Gap 0</Grid>);
      const grid = screen.getByText("Gap 0");
      expect(grid).toHaveClass("gap-0");
    });

    it("should render with gap-2", () => {
      render(<Grid gap={2}>Gap 2</Grid>);
      const grid = screen.getByText("Gap 2");
      expect(grid).toHaveClass("gap-2");
    });

    it("should render with gap-4", () => {
      render(<Grid gap={4}>Gap 4</Grid>);
      const grid = screen.getByText("Gap 4");
      expect(grid).toHaveClass("gap-4");
    });

    it("should render with gap-8", () => {
      render(<Grid gap={8}>Gap 8</Grid>);
      const grid = screen.getByText("Gap 8");
      expect(grid).toHaveClass("gap-8");
    });

    it("should render with gap-16", () => {
      render(<Grid gap={16}>Gap 16</Grid>);
      const grid = screen.getByText("Gap 16");
      expect(grid).toHaveClass("gap-16");
    });

    it("should default to gap-4", () => {
      render(<Grid>Default</Grid>);
      const grid = screen.getByText("Default");
      expect(grid).toHaveClass("gap-4");
    });
  });

  // ============================================================================
  // Alignment Tests
  // ============================================================================

  describe("Alignment", () => {
    it("should render with start alignment", () => {
      render(<Grid align="start">Start</Grid>);
      const grid = screen.getByText("Start");
      expect(grid).toHaveClass("items-start");
    });

    it("should render with center alignment", () => {
      render(<Grid align="center">Center</Grid>);
      const grid = screen.getByText("Center");
      expect(grid).toHaveClass("items-center");
    });

    it("should render with end alignment", () => {
      render(<Grid align="end">End</Grid>);
      const grid = screen.getByText("End");
      expect(grid).toHaveClass("items-end");
    });

    it("should render with stretch alignment", () => {
      render(<Grid align="stretch">Stretch</Grid>);
      const grid = screen.getByText("Stretch");
      expect(grid).toHaveClass("items-stretch");
    });

    it("should default to stretch alignment", () => {
      render(<Grid>Default</Grid>);
      const grid = screen.getByText("Default");
      expect(grid).toHaveClass("items-stretch");
    });
  });

  // ============================================================================
  // Combination Tests
  // ============================================================================

  describe("Combinations", () => {
    it("should render with columns and gap combined", () => {
      render(
        <Grid cols={3} gap={6}>
          Combined
        </Grid>,
      );
      const grid = screen.getByText("Combined");
      expect(grid).toHaveClass("grid-cols-3", "gap-6");
    });

    it("should render with columns, gap, and alignment combined", () => {
      render(
        <Grid cols={4} gap={4} align="center">
          Combined
        </Grid>,
      );
      const grid = screen.getByText("Combined");
      expect(grid).toHaveClass("grid-cols-4", "gap-4", "items-center");
    });

    it("should render with all props combined", () => {
      render(
        <Grid
          cols={2}
          sm={3}
          md={4}
          lg={6}
          xl={12}
          gap={6}
          align="center"
          className="custom"
        >
          All Props
        </Grid>,
      );
      const grid = screen.getByText("All Props");
      expect(grid).toHaveClass(
        "grid-cols-2",
        "sm:grid-cols-3",
        "md:grid-cols-4",
        "lg:grid-cols-6",
        "xl:grid-cols-12",
        "gap-6",
        "items-center",
        "custom",
      );
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty children", () => {
      render(<Grid></Grid>);
      const grid = screen.getByRole("generic");
      expect(grid).toBeInTheDocument();
    });

    it("should render with single child", () => {
      render(<Grid>Single</Grid>);
      expect(screen.getByText("Single")).toBeInTheDocument();
    });

    it("should render with many children", () => {
      render(
        <Grid cols={4}>
          {Array.from({ length: 100 }, (_, i) => (
            <span key={i}>Item {i}</span>
          ))}
        </Grid>,
      );
      expect(screen.getByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 99")).toBeInTheDocument();
    });

    it("should render with nested elements", () => {
      render(
        <Grid>
          <div>
            <span>Nested</span>
          </div>
        </Grid>,
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Grid>Grid</Grid>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all column options", () => {
      const cols = [1, 2, 3, 4, 6, 12] as const;
      cols.forEach((col) => {
        const { container } = render(<Grid cols={col}>{col} cols</Grid>);
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
