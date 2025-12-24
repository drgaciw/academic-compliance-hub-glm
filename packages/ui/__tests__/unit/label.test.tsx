/**
 * Label Component Unit Tests
 *
 * Comprehensive unit tests for Label component covering:
 * - Rendering with default props
 * - Rendering with all variant props (htmlFor, disabled, etc.)
 * - User interactions (click)
 * - Accessibility attributes (ARIA roles, labels)
 * - Edge cases (empty states, disabled states)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Label } from "@/components/label";

describe("Label Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Label>Label text</Label>);
      const label = screen.getByText("Label text");
      expect(label).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Label className="custom-label">Label</Label>);
      const label = screen.getByText("Label");
      expect(label).toHaveClass("custom-label");
    });

    it("should render with default styling", () => {
      render(<Label>Label</Label>);
      const label = screen.getByText("Label");
      expect(label).toHaveClass(
        "text-sm",
        "font-medium",
        "leading-none",
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-70",
      );
    });

    it("should render with id", () => {
      render(<Label id="test-label">Label</Label>);
      const label = screen.getByText("Label");
      expect(label).toHaveAttribute("id", "test-label");
    });

    it("should render with htmlFor attribute", () => {
      render(
        <>
          <Label htmlFor="test-input">Email</Label>
          <input id="test-input" />
        </>,
      );
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "test-input");
    });

    it("should render with long text", () => {
      const longText = "A".repeat(200);
      render(<Label>{longText}</Label>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Label onClick={handleClick}>Clickable Label</Label>);
      await user.click(screen.getByText("Clickable Label"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle click events with event object", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Label onClick={handleClick}>Clickable Label</Label>);
      await user.click(screen.getByText("Clickable Label"));

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
          target: expect.any(HTMLLabelElement),
        }),
      );
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Label aria-label="Email label">Email</Label>);
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("aria-label", "Email label");
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Label aria-describedby="description">Email</Label>
          <span id="description">Email description</span>
        </>,
      );
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("aria-describedby", "description");
    });

    it("should support aria-required", () => {
      render(<Label aria-required="true">Required Field</Label>);
      const label = screen.getByText("Required Field");
      expect(label).toHaveAttribute("aria-required", "true");
    });

    it("should have proper role", () => {
      render(<Label>Label</Label>);
      const label = screen.getByRole("label");
      expect(label).toBeInTheDocument();
    });

    it("should associate with input via htmlFor", () => {
      render(
        <>
          <Label htmlFor="test-input">Email</Label>
          <input id="test-input" />
        </>,
      );
      const label = screen.getByText("Email");
      const input = screen.getByRole("textbox");

      expect(label).toHaveAttribute("for", "test-input");
      expect(input).toHaveAttribute("id", "test-input");
    });
  });

  // ============================================================================
  // Disabled State Tests
  // ============================================================================

  describe("Disabled State", () => {
    it("should render with disabled attribute", () => {
      render(<Label disabled>Disabled Label</Label>);
      const label = screen.getByText("Disabled Label");
      expect(label).toHaveAttribute("data-disabled", "true");
    });

    it("should have disabled styling", () => {
      render(<Label disabled>Disabled Label</Label>);
      const label = screen.getByText("Disabled Label");
      expect(label).toHaveClass(
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-70",
      );
    });

    it("should not be clickable when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Label disabled onClick={handleClick}>
          Disabled Label
        </Label>,
      );
      await user.click(screen.getByText("Disabled Label"));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty content", () => {
      render(<Label></Label>);
      const label = screen.getByRole("label");
      expect(label).toBeInTheDocument();
    });

    it("should render with whitespace content", () => {
      render(<Label> </Label>);
      const label = screen.getByRole("label");
      expect(label).toBeInTheDocument();
    });

    it("should render with special characters", () => {
      render(<Label>Label with {"<special>"} & "quotes"</Label>);
      expect(screen.getByText(/label with/i)).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(<Label>🎉 Label with emoji 🚀</Label>);
      expect(screen.getByText(/label with emoji/i)).toBeInTheDocument();
    });

    it("should render with nested elements", () => {
      render(
        <Label>
          <span>Nested</span>
          <strong>Bold</strong>
          <em>Italic</em>
        </Label>,
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("Italic")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onMouseEnter handler", async () => {
      const handleMouseEnter = vi.fn();
      const user = userEvent.setup();

      render(<Label onMouseEnter={handleMouseEnter}>Hover Label</Label>);
      await user.hover(screen.getByText("Hover Label"));

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("should call onMouseLeave handler", async () => {
      const handleMouseLeave = vi.fn();
      const user = userEvent.setup();

      render(<Label onMouseLeave={handleMouseLeave}>Hover Label</Label>);
      const label = screen.getByText("Hover Label");

      await user.hover(label);
      await user.unhover(label);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Form Integration Tests
  // ============================================================================

  describe("Form Integration", () => {
    it("should work with form inputs", () => {
      render(
        <form>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
          <Label htmlFor="password">Password</Label>
          <input id="password" type="password" />
        </form>,
      );

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("should work with checkbox", () => {
      render(
        <>
          <Label htmlFor="agree">I agree</Label>
          <input id="agree" type="checkbox" />
        </>,
      );

      expect(screen.getByText("I agree")).toBeInTheDocument();
      expect(screen.getByLabelText("I agree")).toBeInTheDocument();
    });

    it("should work with select", () => {
      render(
        <>
          <Label htmlFor="country">Country</Label>
          <select id="country">
            <option>USA</option>
            <option>Canada</option>
          </select>
        </>,
      );

      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Label>Label</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with htmlFor", () => {
      const { container } = render(<Label htmlFor="test-input">Label</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with disabled state", () => {
      const { container } = render(<Label disabled>Disabled Label</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with custom className", () => {
      const { container } = render(
        <Label className="custom-label">Label</Label>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
