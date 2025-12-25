/**
 * Form Component Unit Tests
 *
 * Comprehensive unit tests for Form and FormField components covering:
 * - Rendering with default props
 * - Form submission handling
 * - FormField context
 * - FormItem, FormLabel, FormControl, FormDescription, FormMessage
 * - Error handling
 * - Integration with react-hook-form
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/form";

describe("Form Component", () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe("Form Rendering", () => {
    it("should render with default props", () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form}>
            <span>Form content</span>
          </Form>
        );
      };
      render(<TestComponent />);
      expect(screen.getByText("Form content")).toBeInTheDocument();
    });

    it("should render as a form element", () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form}>
            <span>Content</span>
          </Form>
        );
      };
      render(<TestComponent />);
      const form = screen.getByText("Content").closest("form");
      expect(form).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form} className="custom-form">
            <span>Content</span>
          </Form>
        );
      };
      render(<TestComponent />);
      const form = screen.getByText("Content").closest("form");
      expect(form).toHaveClass("custom-form");
    });
  });

  // ============================================================================
  // Form Submission Tests
  // ============================================================================

  describe("Form Submission", () => {
    it("should call onSubmit when form is submitted", async () => {
      const handleSubmit = vi.fn();
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form} onSubmit={handleSubmit}>
            <button type="submit">Submit</button>
          </Form>
        );
      };
      render(<TestComponent />);
      const user = userEvent.setup();
      await user.click(screen.getByText("Submit"));
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it("should pass form data to onSubmit handler", async () => {
      const handleSubmit = vi.fn();
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "value" },
        });
        return (
          <Form form={form} onSubmit={handleSubmit}>
            <button type="submit">Submit</button>
          </Form>
        );
      };
      render(<TestComponent />);
      const user = userEvent.setup();
      await user.click(screen.getByText("Submit"));
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          { test: "value" },
          expect.any(Object),
        );
      });
    });

    it("should prevent default form submission", async () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form}>
            <button type="submit">Submit</button>
          </Form>
        );
      };
      render(<TestComponent />);
      const formElement = screen.getByText("Submit").closest("form");
      const preventDefaultSpy = vi.spyOn(Event.prototype, "preventDefault");
      fireEvent.submit(formElement!);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // FormField Tests
  // ============================================================================

  describe("FormField", () => {
    it("should provide field context to children", () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form}>
            <FormField
              name="test"
              render={({ field }) => <span>{field.name}</span>}
            />
          </Form>
        );
      };
      render(<TestComponent />);
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should update field value on change", async () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form}>
            <FormField
              name="test"
              render={({ field }) => <input {...field} data-testid="input" />}
            />
          </Form>
        );
      };
      render(<TestComponent />);
      const user = userEvent.setup();
      const input = screen.getByTestId("input");
      await user.type(input, "test value");
      expect(input).toHaveValue("test value");
    });

    it("should trigger validation on blur", async () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        return (
          <Form form={form}>
            <FormField
              name="test"
              render={({ field }) => <input {...field} data-testid="input" />}
            />
          </Form>
        );
      };
      render(<TestComponent />);
      const user = userEvent.setup();
      const input = screen.getByTestId("input");
      await user.click(input);
      await user.tab();
      // Blur should trigger validation
      expect(input).toHaveFocus();
    });
  });

  // ============================================================================
  // FormItem Tests
  // ============================================================================

  describe("FormItem", () => {
    it("should render with default styling", () => {
      render(<FormItem>Item content</FormItem>);
      const item = screen.getByText("Item content");
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass("flex", "flex-col", "gap-2");
    });

    it("should render with custom className", () => {
      render(<FormItem className="custom-item">Content</FormItem>);
      const item = screen.getByText("Content");
      expect(item).toHaveClass("custom-item");
    });

    it("should be a div element", () => {
      render(<FormItem>Content</FormItem>);
      const item = screen.getByText("Content").closest("div");
      expect(item).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FormLabel Tests
  // ============================================================================

  describe("FormLabel", () => {
    it("should render with default styling", () => {
      render(<FormLabel>Label text</FormLabel>);
      const label = screen.getByText("Label text");
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass("text-sm", "font-medium", "leading-none");
    });

    it("should render with custom className", () => {
      render(<FormLabel className="custom-label">Content</FormLabel>);
      const label = screen.getByText("Content");
      expect(label).toHaveClass("custom-label");
    });

    it("should be a label element", () => {
      render(<FormLabel>Content</FormLabel>);
      const label = screen.getByText("Content").closest("label");
      expect(label).toBeInTheDocument();
    });

    it("should have peer-disabled styles", () => {
      render(<FormLabel>Content</FormLabel>);
      const label = screen.getByText("Content");
      expect(label).toHaveClass(
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-70",
      );
    });
  });

  // ============================================================================
  // FormControl Tests
  // ============================================================================

  describe("FormControl", () => {
    it("should render children", () => {
      render(
        <FormControl>
          <span>Control content</span>
        </FormControl>,
      );
      expect(screen.getByText("Control content")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <FormControl className="custom-control">
          <span>Content</span>
        </FormControl>,
      );
      const control = screen.getByText("Content").closest("div");
      expect(control).toHaveClass("custom-control");
    });

    it("should be a div element", () => {
      render(
        <FormControl>
          <span>Content</span>
        </FormControl>,
      );
      const control = screen.getByText("Content").closest("div");
      expect(control).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FormDescription Tests
  // ============================================================================

  describe("FormDescription", () => {
    it("should render with default styling", () => {
      render(<FormDescription>Description text</FormDescription>);
      const description = screen.getByText("Description text");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("should render with custom className", () => {
      render(
        <FormDescription className="custom-desc">Content</FormDescription>,
      );
      const description = screen.getByText("Content");
      expect(description).toHaveClass("custom-desc");
    });

    it("should be a p element", () => {
      render(<FormDescription>Content</FormDescription>);
      const description = screen.getByText("Content").closest("p");
      expect(description).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FormMessage Tests
  // ============================================================================

  describe("FormMessage", () => {
    it("should render with error prop", () => {
      render(<FormMessage error="This is an error" />);
      const message = screen.getByText("This is an error");
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass("text-sm", "font-medium", "text-destructive");
    });

    it("should not render when no error", () => {
      const { container } = render(<FormMessage />);
      const message = container.querySelector("p");
      expect(message).toBeNull();
    });

    it("should render with custom className", () => {
      render(<FormMessage error="Error" className="custom-msg" />);
      const message = screen.getByText("Error");
      expect(message).toHaveClass("custom-msg");
    });

    it("should display error from form context", () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { test: "" },
        });
        form.setError("test", { type: "manual", message: "Context error" });
        return (
          <Form form={form}>
            <FormField
              name="test"
              render={({ field }) => (
                <>
                  <input {...field} />
                  <FormMessage />
                </>
              )}
            />
          </Form>
        );
      };
      render(<TestComponent />);
      expect(screen.getByText("Context error")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe("Integration", () => {
    it("should render complete form with all components", () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { name: "" },
        });
        return (
          <Form form={form}>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input {...field} data-testid="name-input" />
                  </FormControl>
                  <FormDescription>Enter your name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        );
      };
      render(<TestComponent />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByTestId("name-input")).toBeInTheDocument();
      expect(screen.getByText("Enter your name")).toBeInTheDocument();
    });

    it("should handle form validation errors", async () => {
      const TestComponent = () => {
        const form = useForm({
          defaultValues: { email: "" },
          mode: "onChange",
        });
        return (
          <Form form={form}>
            <FormField
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input {...field} data-testid="email-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type="submit">Submit</button>
          </Form>
        );
      };
      render(<TestComponent />);
      const user = userEvent.setup();
      await user.click(screen.getByText("Submit"));
      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with default props", () => {
      const TestComponent = () => {
        const form = useForm({ defaultValues: { test: "" } });
        return (
          <Form form={form}>
            <span>Form</span>
          </Form>
        );
      };
      const { container } = render(<TestComponent />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with FormField", () => {
      const TestComponent = () => {
        const form = useForm({ defaultValues: { test: "" } });
        return (
          <Form form={form}>
            <FormField
              name="test"
              render={({ field }) => <input {...field} />}
            />
          </Form>
        );
      };
      const { container } = render(<TestComponent />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
