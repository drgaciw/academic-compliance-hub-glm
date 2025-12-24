/**
 * Input Component Unit Tests
 *
 * Comprehensive unit tests for Input component covering:
 * - Rendering with default props
 * - Rendering with all variant props (type, size, etc.)
 * - User interactions (type, focus, blur, change)
 * - Accessibility attributes (ARIA roles, labels)
 * - Edge cases (empty states, disabled states, validation states)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/input";

describe("Input Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("should render with custom className", () => {
      render(<Input className="custom-input" placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveClass("custom-input");
    });

    it("should render with id", () => {
      render(<Input id="test-input" placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveAttribute("id", "test-input");
    });

    it("should render with name", () => {
      render(<Input name="test-name" placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveAttribute("name", "test-name");
    });

    it("should render with value", () => {
      render(<Input value="Test value" placeholder="Enter text" />);
      const input = screen.getByDisplayValue("Test value");
      expect(input).toBeInTheDocument();
    });

    it("should render with default styling", () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveClass(
        "flex",
        "h-9",
        "w-full",
        "rounded-md",
        "border",
        "border-input",
        "bg-transparent",
        "px-3",
        "py-1",
        "text-base",
        "shadow-sm",
        "transition-colors",
      );
    });
  });

  // ============================================================================
  // Type Tests
  // ============================================================================

  describe("Input Types", () => {
    it("should render with text type", () => {
      render(<Input type="text" placeholder="Text input" />);
      const input = screen.getByPlaceholderText(/text input/i);
      expect(input).toHaveAttribute("type", "text");
    });

    it("should render with password type", () => {
      render(<Input type="password" placeholder="Password" />);
      const input = screen.getByPlaceholderText(/password/i);
      expect(input).toHaveAttribute("type", "password");
    });

    it("should render with email type", () => {
      render(<Input type="email" placeholder="Email" />);
      const input = screen.getByPlaceholderText(/email/i);
      expect(input).toHaveAttribute("type", "email");
    });

    it("should render with number type", () => {
      render(<Input type="number" placeholder="Number" />);
      const input = screen.getByPlaceholderText(/number/i);
      expect(input).toHaveAttribute("type", "number");
    });

    it("should render with tel type", () => {
      render(<Input type="tel" placeholder="Phone" />);
      const input = screen.getByPlaceholderText(/phone/i);
      expect(input).toHaveAttribute("type", "tel");
    });

    it("should render with url type", () => {
      render(<Input type="url" placeholder="URL" />);
      const input = screen.getByPlaceholderText(/url/i);
      expect(input).toHaveAttribute("type", "url");
    });

    it("should render with search type", () => {
      render(<Input type="search" placeholder="Search" />);
      const input = screen.getByPlaceholderText(/search/i);
      expect(input).toHaveAttribute("type", "search");
    });

    it("should render with date type", () => {
      render(<Input type="date" placeholder="Date" />);
      const input = screen.getByPlaceholderText(/date/i);
      expect(input).toHaveAttribute("type", "date");
    });

    it("should render with time type", () => {
      render(<Input type="time" placeholder="Time" />);
      const input = screen.getByPlaceholderText(/time/i);
      expect(input).toHaveAttribute("type", "time");
    });

    it("should render with datetime-local type", () => {
      render(<Input type="datetime-local" placeholder="Date and time" />);
      const input = screen.getByPlaceholderText(/date and time/i);
      expect(input).toHaveAttribute("type", "datetime-local");
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should call onChange when value changes", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} placeholder="Type here" />);
      const input = screen.getByPlaceholderText(/type here/i);

      await user.type(input, "Hello");
      expect(handleChange).toHaveBeenCalledWith(expect.anything());
    });

    it("should call onFocus when focused", async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(<Input onFocus={handleFocus} placeholder="Focus me" />);
      const input = screen.getByPlaceholderText(/focus me/i);

      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("should call onBlur when blurred", async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Input onBlur={handleBlur} placeholder="Blur me" />);
      const input = screen.getByPlaceholderText(/blur me/i);

      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("should call onInput when typing", async () => {
      const handleInput = vi.fn();
      const user = userEvent.setup();

      render(<Input onInput={handleInput} placeholder="Type here" />);
      const input = screen.getByPlaceholderText(/type here/i);

      await user.type(input, "Hello");
      expect(handleInput).toHaveBeenCalled();
    });

    it("should update value when typing", async () => {
      const user = userEvent.setup();

      render(<Input placeholder="Type here" />);
      const input = screen.getByPlaceholderText(/type here/i);

      await user.type(input, "Hello");
      expect(input).toHaveValue("Hello");
    });

    it("should clear value when cleared", async () => {
      const user = userEvent.setup();

      render(<Input value="Initial value" placeholder="Type here" />);
      const input = screen.getByDisplayValue("Initial value");

      await user.clear(input);
      expect(input).toHaveValue("");
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Input aria-label="Email input" placeholder="Enter email" />);
      const input = screen.getByPlaceholderText(/enter email/i);
      expect(input).toHaveAttribute("aria-label", "Email input");
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Input aria-describedby="description" placeholder="Enter text" />
          <span id="description">Input description</span>
        </>,
      );
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveAttribute("aria-describedby", "description");
    });

    it("should support aria-invalid", () => {
      render(<Input aria-invalid="true" placeholder="Invalid input" />);
      const input = screen.getByPlaceholderText(/invalid input/i);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should support aria-required", () => {
      render(<Input aria-required="true" placeholder="Required input" />);
      const input = screen.getByPlaceholderText(/required input/i);
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();

      render(<Input placeholder="Focusable" />);
      const input = screen.getByPlaceholderText(/focusable/i);

      await user.tab();
      expect(input).toHaveFocus();
    });

    it("should have proper focus styles", () => {
      render(<Input placeholder="Focusable" />);
      const input = screen.getByPlaceholderText(/focusable/i);
      expect(input).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-1",
      );
    });
  });

  // ============================================================================
  // Disabled State Tests
  // ============================================================================

  describe("Disabled State", () => {
    it("should render with disabled attribute", () => {
      render(<Input disabled placeholder="Disabled input" />);
      const input = screen.getByPlaceholderText(/disabled input/i);
      expect(input).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<Input disabled placeholder="Disabled input" />);
      const input = screen.getByPlaceholderText(/disabled input/i);
      expect(input).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
      );
    });

    it("should not be editable when disabled", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input disabled onChange={handleChange} placeholder="Disabled" />);
      const input = screen.getByPlaceholderText(/disabled/i);

      await user.type(input, "Hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("should not be focusable when disabled", async () => {
      const user = userEvent.setup();

      render(<Input disabled placeholder="Disabled" />);
      const input = screen.getByPlaceholderText(/disabled/i);

      await user.tab();
      expect(input).not.toHaveFocus();
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe("Validation", () => {
    it("should render with required attribute", () => {
      render(<Input required placeholder="Required field" />);
      const input = screen.getByPlaceholderText(/required field/i);
      expect(input).toHaveAttribute("required");
    });

    it("should render with minLength", () => {
      render(<Input minLength={3} placeholder="Min 3 chars" />);
      const input = screen.getByPlaceholderText(/min 3 chars/i);
      expect(input).toHaveAttribute("minlength", "3");
    });

    it("should render with maxLength", () => {
      render(<Input maxLength={20} placeholder="Max 20 chars" />);
      const input = screen.getByPlaceholderText(/max 20 chars/i);
      expect(input).toHaveAttribute("maxlength", "20");
    });

    it("should render with pattern", () => {
      render(<Input pattern="[A-Za-z]+" placeholder="Letters only" />);
      const input = screen.getByPlaceholderText(/letters only/i);
      expect(input).toHaveAttribute("pattern", "[A-Za-z]+");
    });

    it("should render with min and max for number type", () => {
      render(<Input type="number" min={0} max={100} placeholder="0-100" />);
      const input = screen.getByPlaceholderText(/0-100/i);
      expect(input).toHaveAttribute("min", "0");
      expect(input).toHaveAttribute("max", "100");
    });

    it("should render with step for number type", () => {
      render(<Input type="number" step={0.5} placeholder="Step 0.5" />);
      const input = screen.getByPlaceholderText(/step 0.5/i);
      expect(input).toHaveAttribute("step", "0.5");
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty value", () => {
      render(<Input value="" placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveValue("");
    });

    it("should render with whitespace value", () => {
      render(<Input value="   " placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toHaveValue("   ");
    });

    it("should render with very long value", () => {
      const longValue = "A".repeat(10000);
      render(<Input value={longValue} placeholder="Enter text" />);
      const input = screen.getByDisplayValue(longValue);
      expect(input).toBeInTheDocument();
    });

    it("should render with special characters", () => {
      render(<Input value='<special> & "quotes"' placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(<Input value="🎉 Hello 🚀" placeholder="Enter text" />);
      const input = screen.getByDisplayValue("🎉 Hello 🚀");
      expect(input).toBeInTheDocument();
    });

    it("should handle rapid typing", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} placeholder="Type here" />);
      const input = screen.getByPlaceholderText(/type here/i);

      // Rapid typing
      for (let i = 0; i < 100; i++) {
        await user.type(input, "a");
      }

      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onKeyDown handler", async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();

      render(<Input onKeyDown={handleKeyDown} placeholder="Type here" />);
      const input = screen.getByPlaceholderText(/type here/i);

      await user.type(input, "a");
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it("should call onKeyUp handler", async () => {
      const handleKeyUp = vi.fn();
      const user = userEvent.setup();

      render(<Input onKeyUp={handleKeyUp} placeholder="Type here" />);
      const input = screen.getByPlaceholderText(/type here/i);

      await user.type(input, "a");
      expect(handleKeyUp).toHaveBeenCalled();
    });

    it("should call onSelect handler", async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();

      render(<Input onSelect={handleSelect} placeholder="Select text" />);
      const input = screen.getByPlaceholderText(/select text/i);

      await user.click(input);
      await user.keyboard("{Control}a");
      expect(handleSelect).toHaveBeenCalled();
    });

    it("should call onPaste handler", async () => {
      const handlePaste = vi.fn();
      const user = userEvent.setup();

      render(<Input onPaste={handlePaste} placeholder="Paste here" />);
      const input = screen.getByPlaceholderText(/paste here/i);

      await user.paste(input, "Pasted text");
      expect(handlePaste).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Ref Tests
  // ============================================================================

  describe("Ref", () => {
    it("should forward ref to input element", () => {
      const ref = { current: null as HTMLInputElement | null };

      render(
        <Input
          ref={(el) => {
            ref.current = el;
          }}
          placeholder="Enter text"
        />,
      );

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("should allow accessing input methods via ref", () => {
      const ref = { current: null as HTMLInputElement | null };

      render(
        <Input
          ref={(el) => {
            ref.current = el;
          }}
          placeholder="Enter text"
        />,
      );

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.select).toBeDefined();
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<Input placeholder="Enter text" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all types", () => {
      const types = [
        "text",
        "password",
        "email",
        "number",
        "tel",
        "url",
        "search",
        "date",
        "time",
      ] as const;

      types.forEach((type) => {
        const { container } = render(
          <Input type={type} placeholder={`${type} input`} />,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    it("should match snapshot with disabled state", () => {
      const { container } = render(<Input disabled placeholder="Disabled" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
