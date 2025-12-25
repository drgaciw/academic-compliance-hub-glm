/**
 * Badge Component Unit Tests
 *
 * Comprehensive unit tests for Badge component covering:
 * - Rendering with default props
 * - Rendering with all variant props (default, secondary, destructive, outline, success, warning)
 * - User interactions
 * - Accessibility attributes (ARIA roles, labels)
 * - Edge cases (empty states, nested content)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge, badgeVariants } from "@/components/badge";

describe("Badge Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Badge>Badge text</Badge>);
      const badge = screen.getByText("Badge text");
      expect(badge).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Badge className="custom-badge">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("custom-badge");
    });

    it("should render with default styling", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "rounded-full",
        "border",
        "px-2.5",
        "py-0.5",
        "text-xs",
        "font-semibold",
        "transition-colors",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-ring",
        "focus:ring-offset-2",
      );
    });

    it("should render with id", () => {
      render(<Badge id="test-badge">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("id", "test-badge");
    });

    it("should render with data-testid", () => {
      render(<Badge data-testid="test-badge">Badge</Badge>);
      const badge = screen.getByTestId("test-badge");
      expect(badge).toBeInTheDocument();
    });

    it("should render with long text", () => {
      const longText = "A".repeat(200);
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Variant Tests
  // ============================================================================

  describe("Variants", () => {
    it("should render with default variant", () => {
      render(<Badge variant="default">Default Badge</Badge>);
      const badge = screen.getByText("Default Badge");
      expect(badge).toHaveClass(
        "border-transparent",
        "bg-primary",
        "text-primary-foreground",
        "hover:bg-primary/80",
      );
    });

    it("should render with secondary variant", () => {
      render(<Badge variant="secondary">Secondary Badge</Badge>);
      const badge = screen.getByText("Secondary Badge");
      expect(badge).toHaveClass(
        "border-transparent",
        "bg-secondary",
        "text-secondary-foreground",
        "hover:bg-secondary/80",
      );
    });

    it("should render with destructive variant", () => {
      render(<Badge variant="destructive">Destructive Badge</Badge>);
      const badge = screen.getByText("Destructive Badge");
      expect(badge).toHaveClass(
        "border-transparent",
        "bg-destructive",
        "text-destructive-foreground",
        "hover:bg-destructive/80",
      );
    });

    it("should render with outline variant", () => {
      render(<Badge variant="outline">Outline Badge</Badge>);
      const badge = screen.getByText("Outline Badge");
      expect(badge).toHaveClass("text-foreground");
    });

    it("should render with success variant", () => {
      render(<Badge variant="success">Success Badge</Badge>);
      const badge = screen.getByText("Success Badge");
      expect(badge).toHaveClass(
        "border-transparent",
        "bg-green-100",
        "text-green-800",
        "hover:bg-green-200",
      );
    });

    it("should render with warning variant", () => {
      render(<Badge variant="warning">Warning Badge</Badge>);
      const badge = screen.getByText("Warning Badge");
      expect(badge).toHaveClass(
        "border-transparent",
        "bg-yellow-100",
        "text-yellow-800",
        "hover:bg-yellow-200",
      );
    });

    it("should default to default variant when no variant specified", () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText("Default Badge");
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("should combine variant with custom className", () => {
      render(
        <Badge variant="success" className="custom-class">
          Custom Badge
        </Badge>,
      );
      const badge = screen.getByText("Custom Badge");
      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);
      await user.click(screen.getByText("Clickable Badge"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle click events with event object", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);
      await user.click(screen.getByText("Clickable Badge"));

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
          target: expect.any(HTMLDivElement),
        }),
      );
    });

    it("should handle double click events", async () => {
      const handleDoubleClick = vi.fn();
      const user = userEvent.setup();

      render(<Badge onDoubleClick={handleDoubleClick}>Badge</Badge>);
      await user.dblClick(screen.getByText("Badge"));

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Badge aria-label="Status badge">Active</Badge>);
      const badge = screen.getByText("Active");
      expect(badge).toHaveAttribute("aria-label", "Status badge");
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Badge aria-describedby="badge-description">Status</Badge>
          <span id="badge-description">Current status</span>
        </>,
      );
      const badge = screen.getByText("Status");
      expect(badge).toHaveAttribute("aria-describedby", "badge-description");
    });

    it("should support aria-live for dynamic content", () => {
      render(<Badge aria-live="polite">Updating status</Badge>);
      const badge = screen.getByText("Updating status");
      expect(badge).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper focus styles", () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);
      const badge = screen.getByText("Focusable Badge");
      expect(badge).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-ring",
        "focus:ring-offset-2",
      );
    });

    it("should be keyboard accessible with tabIndex", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Badge onClick={handleClick} onKeyDown={handleClick} tabIndex={0}>
          Focusable Badge
        </Badge>,
      );

      await user.tab();
      expect(screen.getByText("Focusable Badge")).toHaveFocus();

      // Div with tabIndex doesn't trigger click on Enter by default
      // So we verify onKeyDown is called instead
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty content", () => {
      const { container } = render(<Badge></Badge>);
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeInTheDocument();
    });

    it("should render with whitespace content", () => {
      const { container } = render(<Badge> </Badge>);
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeInTheDocument();
    });

    it("should render with special characters", () => {
      render(<Badge>Badge with {"<special>"} & "quotes"</Badge>);
      expect(screen.getByText(/badge with/i)).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(<Badge>🎉 Badge with emoji 🚀</Badge>);
      expect(screen.getByText(/badge with emoji/i)).toBeInTheDocument();
    });

    it("should render with nested elements", () => {
      render(
        <Badge>
          <span>Text</span>
          <strong>Bold</strong>
        </Badge>,
      );
      expect(screen.getByText("Text")).toBeInTheDocument();
      expect(screen.getByText("Bold")).toBeInTheDocument();
    });

    it("should render with very long text", () => {
      const longText = "A".repeat(1000);
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should handle rapid clicks", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Badge onClick={handleClick}>Badge</Badge>);

      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByText("Badge"));
      }

      expect(handleClick).toHaveBeenCalledTimes(10);
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onMouseEnter handler", async () => {
      const handleMouseEnter = vi.fn();
      const user = userEvent.setup();

      render(<Badge onMouseEnter={handleMouseEnter}>Hover Badge</Badge>);
      await user.hover(screen.getByText("Hover Badge"));

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("should call onMouseLeave handler", async () => {
      const handleMouseLeave = vi.fn();
      const user = userEvent.setup();

      render(<Badge onMouseLeave={handleMouseLeave}>Hover Badge</Badge>);
      const badge = screen.getByText("Hover Badge");

      await user.hover(badge);
      await user.unhover(badge);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it("should call onFocus handler", async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(
        <Badge onFocus={handleFocus} tabIndex={0}>
          Badge
        </Badge>,
      );

      await user.tab();
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("should call onBlur handler", async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(
        <Badge onBlur={handleBlur} tabIndex={0}>
          Badge
        </Badge>,
      );

      await user.tab();
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // badgeVariants Utility Tests
  // ============================================================================

  describe("badgeVariants utility", () => {
    it("should generate default variant classes", () => {
      const classes = badgeVariants({ variant: "default" });
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("text-primary-foreground");
    });

    it("should generate secondary variant classes", () => {
      const classes = badgeVariants({ variant: "secondary" });
      expect(classes).toContain("bg-secondary");
      expect(classes).toContain("text-secondary-foreground");
    });

    it("should generate destructive variant classes", () => {
      const classes = badgeVariants({ variant: "destructive" });
      expect(classes).toContain("bg-destructive");
      expect(classes).toContain("text-destructive-foreground");
    });

    it("should generate outline variant classes", () => {
      const classes = badgeVariants({ variant: "outline" });
      expect(classes).toContain("text-foreground");
    });

    it("should generate success variant classes", () => {
      const classes = badgeVariants({ variant: "success" });
      expect(classes).toContain("bg-green-100");
      expect(classes).toContain("text-green-800");
    });

    it("should generate warning variant classes", () => {
      const classes = badgeVariants({ variant: "warning" });
      expect(classes).toContain("bg-yellow-100");
      expect(classes).toContain("text-yellow-800");
    });

    it("should generate default classes when no variant specified", () => {
      const classes = badgeVariants({});
      expect(classes).toContain("bg-primary");
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all variants", () => {
      const variants: Array<
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning"
      > = [
        "default",
        "secondary",
        "destructive",
        "outline",
        "success",
        "warning",
      ];

      variants.forEach((variant) => {
        const { container } = render(
          <Badge variant={variant}>{variant} badge</Badge>,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    it("should match snapshot with custom className", () => {
      const { container } = render(
        <Badge className="custom-badge">Custom Badge</Badge>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with click handler", () => {
      const { container } = render(
        <Badge onClick={() => {}}>Clickable Badge</Badge>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  // ============================================================================
  // Common Use Cases
  // ============================================================================

  describe("Common Use Cases", () => {
    it("should work as status indicator", () => {
      render(<Badge variant="success">Active</Badge>);
      const badge = screen.getByText("Active");
      expect(badge).toHaveClass("bg-green-100");
    });

    it("should work as count indicator", () => {
      render(<Badge variant="destructive">5</Badge>);
      const badge = screen.getByText("5");
      expect(badge).toHaveClass("bg-destructive");
    });

    it("should work in a list of badges", () => {
      render(
        <div>
          <Badge variant="default">Tag 1</Badge>
          <Badge variant="secondary">Tag 2</Badge>
          <Badge variant="success">Tag 3</Badge>
        </div>,
      );

      expect(screen.getByText("Tag 1")).toBeInTheDocument();
      expect(screen.getByText("Tag 2")).toBeInTheDocument();
      expect(screen.getByText("Tag 3")).toBeInTheDocument();
    });

    it("should work inside other components", () => {
      render(
        <div data-testid="parent">
          <Badge>Nested Badge</Badge>
        </div>,
      );

      const parent = screen.getByTestId("parent");
      expect(parent).toContainElement(screen.getByText("Nested Badge"));
    });

    it("should work with aria-current for current item", () => {
      render(<Badge aria-current="page">Current Page</Badge>);
      const badge = screen.getByText("Current Page");
      expect(badge).toHaveAttribute("aria-current", "page");
    });
  });
});
