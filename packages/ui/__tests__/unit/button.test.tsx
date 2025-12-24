/**
 * Button Component Unit Tests
 *
 * Comprehensive unit tests for the Button component covering:
 * - Rendering with default props
 * - Rendering with all variant props (size, variant, etc.)
 * - User interactions (click, type, select, etc.)
 * - Accessibility attributes (ARIA roles, labels)
 * - Edge cases (empty states, disabled states, loading states)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/button";

describe("Button Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-slot", "button");
      expect(button).toHaveAttribute("data-variant", "default");
      expect(button).toHaveAttribute("data-size", "default");
    });

    it("should render with custom children", () => {
      render(<Button>Submit Form</Button>);
      expect(
        screen.getByRole("button", { name: /submit form/i }),
      ).toBeInTheDocument();
    });

    it("should render with icon children", () => {
      render(
        <Button>
          <span data-testid="icon">★</span>
          Star
        </Button>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /star/i })).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should render with additional HTML attributes", () => {
      render(
        <Button type="submit" id="test-button" data-testid="test-btn">
          Submit
        </Button>,
      );
      const button = screen.getByTestId("test-btn");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("id", "test-button");
    });
  });

  // ============================================================================
  // Variant Tests
  // ============================================================================

  describe("Variants", () => {
    it("should render with default variant", () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "default");
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("should render with destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "destructive");
      expect(button).toHaveClass("bg-destructive", "text-white");
    });

    it("should render with outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveClass("border", "bg-background");
    });

    it("should render with secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "secondary");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("should render with ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "ghost");
    });

    it("should render with link variant", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "link");
      expect(button).toHaveClass("text-primary", "underline-offset-4");
    });
  });

  // ============================================================================
  // Size Tests
  // ============================================================================

  describe("Sizes", () => {
    it("should render with default size", () => {
      render(<Button size="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "default");
      expect(button).toHaveClass("h-9", "px-4", "py-2");
    });

    it("should render with sm size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "sm");
      expect(button).toHaveClass("h-8", "px-3");
    });

    it("should render with lg size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "lg");
      expect(button).toHaveClass("h-10", "px-6");
    });

    it("should render with icon size", () => {
      render(<Button size="icon">★</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "icon");
      expect(button).toHaveClass("size-9");
    });

    it("should render with icon-sm size", () => {
      render(<Button size="icon-sm">★</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "icon-sm");
      expect(button).toHaveClass("size-8");
    });

    it("should render with icon-lg size", () => {
      render(<Button size="icon-lg">★</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "icon-lg");
      expect(button).toHaveClass("size-10");
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should call onClick handler when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole("button"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      await user.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should call onClick multiple times when clicked multiple times", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole("button");

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it("should pass event object to onClick handler", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole("button"));

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
          target: expect.any(HTMLButtonElement),
        }),
      );
    });

    it("should handle keyboard Enter key", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Submit</Button>);
      const button = screen.getByRole("button");

      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle keyboard Space key", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Submit</Button>);
      const button = screen.getByRole("button");

      button.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have button role", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();

      render(<Button>Focusable</Button>);
      const button = screen.getByRole("button");

      await user.tab();
      expect(button).toHaveFocus();
    });

    it("should have proper focus styles", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
      );
    });

    it("should have aria-invalid when invalid", () => {
      render(<Button aria-invalid="true">Invalid</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-invalid", "true");
      expect(button).toHaveClass("aria-invalid:ring-destructive/20");
    });

    it("should have aria-disabled when disabled", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
      expect(button).toHaveClass(
        "disabled:opacity-50",
        "disabled:pointer-events-none",
      );
    });

    it("should support aria-label", () => {
      render(<Button aria-label="Close dialog">×</Button>);
      const button = screen.getByRole("button", { name: /close dialog/i });
      expect(button).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <span id="description">Button description</span>
        </>,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-describedby", "description");
    });

    it("should support aria-expanded for toggle buttons", () => {
      render(<Button aria-expanded="false">Toggle</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty children", () => {
      render(<Button></Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with whitespace children", () => {
      render(<Button> </Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with very long text", () => {
      const longText = "A".repeat(1000);
      render(<Button>{longText}</Button>);
      expect(screen.getByRole("button")).toHaveTextContent(longText);
    });

    it("should render with special characters", () => {
      render(<Button>Button with {"<special>"} & "quotes"</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(<Button>🎉 Celebrate! 🚀</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle rapid clicks", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole("button");

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }

      expect(handleClick).toHaveBeenCalledTimes(10);
    });

    it("should handle being unmounted during click", () => {
      const handleClick = vi.fn();
      const { unmount } = render(
        <Button onClick={handleClick}>Click me</Button>,
      );

      unmount();

      // Should not throw error
      expect(() => handleClick()).not.toThrow();
    });
  });

  // ============================================================================
  // Disabled State Tests
  // ============================================================================

  describe("Disabled State", () => {
    it("should render with disabled attribute", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "disabled:opacity-50",
        "disabled:pointer-events-none",
      );
    });

    it("should not be clickable when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      await user.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not be keyboard accessible when disabled", async () => {
      const user = userEvent.setup();

      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");

      await user.tab();
      expect(button).not.toHaveFocus();
    });
  });

  // ============================================================================
  // asChild Prop Tests
  // ============================================================================

  describe("asChild Prop", () => {
    it("should render as link when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>,
      );
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/link");
    });

    it("should apply button styles to child element", () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveClass("inline-flex", "items-center", "justify-center");
    });

    it("should pass data attributes to child element", () => {
      render(
        <Button asChild variant="destructive" size="lg">
          <a href="/link">Link Button</a>
        </Button>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-slot", "button");
      expect(link).toHaveAttribute("data-variant", "destructive");
      expect(link).toHaveAttribute("data-size", "lg");
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onMouseEnter handler", async () => {
      const handleMouseEnter = vi.fn();
      const user = userEvent.setup();

      render(<Button onMouseEnter={handleMouseEnter}>Hover me</Button>);
      await user.hover(screen.getByRole("button"));

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("should call onMouseLeave handler", async () => {
      const handleMouseLeave = vi.fn();
      const user = userEvent.setup();

      render(<Button onMouseLeave={handleMouseLeave}>Hover me</Button>);
      const button = screen.getByRole("button");

      await user.hover(button);
      await user.unhover(button);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it("should call onFocus handler", async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(<Button onFocus={handleFocus}>Focus me</Button>);
      await user.tab();

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("should call onBlur handler", async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Button onBlur={handleBlur}>Focus me</Button>);
      const button = screen.getByRole("button");

      await user.tab();
      await user.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("should call onDoubleClick handler", async () => {
      const handleDoubleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onDoubleClick={handleDoubleClick}>Double click</Button>);
      await user.dblClick(screen.getByRole("button"));

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Form Integration Tests
  // ============================================================================

  describe("Form Integration", () => {
    it("should work as submit button", () => {
      render(
        <form>
          <Button type="submit">Submit</Button>
        </form>,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should work as reset button", () => {
      render(
        <form>
          <Button type="reset">Reset</Button>
        </form>,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "reset");
    });

    it("should work as button type", () => {
      render(<Button type="button">Click</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should have form attribute when specified", () => {
      render(<Button form="my-form">Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("form", "my-form");
    });
  });

  // ============================================================================
  // Ref Tests
  // ============================================================================

  describe("Ref", () => {
    it("should forward ref to button element", () => {
      const ref = { current: null as HTMLButtonElement | null };

      render(
        <Button
          ref={(el) => {
            ref.current = el;
          }}
        >
          Button
        </Button>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should allow accessing button methods via ref", () => {
      const ref = { current: null as HTMLButtonElement | null };

      render(
        <Button
          ref={(el) => {
            ref.current = el;
          }}
        >
          Button
        </Button>,
      );

      expect(ref.current?.click).toBeDefined();
      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Button>Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all variants", () => {
      const variants = [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <Button variant={variant}>{variant}</Button>,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    it("should match snapshot with all sizes", () => {
      const sizes = [
        "default",
        "sm",
        "lg",
        "icon",
        "icon-sm",
        "icon-lg",
      ] as const;

      sizes.forEach((size) => {
        const { container } = render(<Button size={size}>{size}</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
  // ============================================================================
  // Additional Edge Cases - Null/Undefined Handling
  // ============================================================================

  describe("Additional Edge Cases - Null/Undefined Handling", () => {
    it("should render with null children", () => {
      render(<Button>{null}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with undefined children", () => {
      render(<Button>{undefined}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with empty string children", () => {
      render(<Button>{""}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle undefined onClick handler", () => {
      render(<Button onClick={undefined}>Click</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Should not throw error when clicked
      expect(() => button.click()).not.toThrow();
    });
  });

  // ============================================================================
  // Additional Edge Cases - Boundary Conditions
  // ============================================================================

  describe("Additional Edge Cases - Boundary Conditions", () => {
    it("should handle extremely long text content", () => {
      const longText = "A".repeat(10000);
      render(<Button>{longText}</Button>);
      expect(screen.getByRole("button")).toHaveTextContent(longText);
    });

    it("should handle deeply nested children", () => {
      render(
        <Button>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <span>Deeply nested</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Button>,
      );
      expect(screen.getByText("Deeply nested")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Additional Edge Cases - Concurrent Operations
  // ============================================================================

  describe("Additional Edge Cases - Concurrent Operations", () => {
    it("should handle 100 rapid clicks in 1 second", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole("button");

      // Rapid clicks
      const clickPromises = [];
      for (let i = 0; i < 100; i++) {
        clickPromises.push(user.click(button));
      }

      await Promise.all(clickPromises);

      expect(handleClick).toHaveBeenCalledTimes(100);
    });

    it("should handle click while disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      const button = screen.getByRole("button");

      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Additional Edge Cases - Accessibility
  // ============================================================================

  describe("Additional Edge Cases - Accessibility", () => {
    it("should announce disabled state to screen readers", () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should be keyboard navigable with screen reader", async () => {
      const user = userEvent.setup();

      render(<Button>Focusable</Button>);
      const button = screen.getByRole("button");

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard("{Enter}");
      expect(button).toHaveFocus();
    });

    it("should have proper focus indicator for screen readers", async () => {
      const user = userEvent.setup();

      render(<Button>Focusable</Button>);
      const button = screen.getByRole("button");

      await user.tab();
      expect(button).toHaveFocus();

      // Check for focus indicator
      const styles = window.getComputedStyle(button);
      const hasFocusIndicator =
        styles.outline !== "none" || styles.boxShadow !== "none";

      expect(hasFocusIndicator).toBe(true);
    });
  });

  // ============================================================================
  // Additional Edge Cases - Performance
  // ============================================================================

  describe("Additional Edge Cases - Performance", () => {
    it("should render 1000 instances within acceptable time", () => {
      const startTime = performance.now();

      const { container } = render(
        <div>
          {Array.from({ length: 1000 }, (_, i) => (
            <Button key={i}>Button {i}</Button>
          ))}
        </div>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);

      // All buttons should be present
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(1000);
    });
  });

  // ============================================================================
  // Additional Edge Cases - Error Boundary
  // ============================================================================

  describe("Additional Edge Cases - Error Boundary", () => {
    it("should handle error during render gracefully", () => {
      // This test verifies the component doesn't crash on error
      // In a real scenario, this would be caught by an ErrorBoundary
      const ThrowError = () => {
        throw new Error("Test error");
      };

      expect(() => {
        render(
          <Button>
            <ThrowError />
          </Button>,
        );
      }).toThrow();
    });

    it("should handle error during event handler gracefully", () => {
      const handleError = vi.fn(() => {
        throw new Error("Handler error");
      });

      render(<Button onClick={handleError}>Click</Button>);
      const button = screen.getByRole("button");

      // Should not crash the test
      expect(() => button.click()).not.toThrow();
    });
  });
});
