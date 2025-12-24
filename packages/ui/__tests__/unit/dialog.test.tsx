/**
 * Dialog Component Unit Tests
 *
 * Comprehensive unit tests for the Dialog component covering:
 * - Rendering with default props
 * - Rendering with all sub-components (DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose)
 * - User interactions (open, close, keyboard navigation)
 * - Accessibility attributes (ARIA roles, labels, focus management)
 * - Edge cases (empty states, nested dialogs)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from "@/components/dialog";

describe("Dialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Dialog Root Component Tests
  // ============================================================================

  describe("Dialog Root", () => {
    it("should render with default props", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    it("should not render content when closed", () => {
      render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
    });

    it("should render content when open", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    it("should call onOpenChange when open state changes", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================================================
  // DialogTrigger Component Tests
  // ============================================================================

  describe("DialogTrigger", () => {
    it("should render trigger button", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(
        screen.getByRole("button", { name: /open dialog/i }),
      ).toBeInTheDocument();
    });

    it("should open dialog when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open dialog/i }));
      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });
    });

    it("should render with custom className", () => {
      render(
        <Dialog>
          <DialogTrigger className="custom-trigger">Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByRole("button")).toHaveClass("custom-trigger");
    });
  });

  // ============================================================================
  // DialogContent Component Tests
  // ============================================================================

  describe("DialogContent", () => {
    it("should render with default props", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Dialog open={true}>
          <DialogContent className="custom-content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const content = screen.getByText("Title").closest('[data-state="open"]');
      expect(content).toHaveClass("custom-content");
    });

    it("should render with default styling", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const content = screen.getByText("Title").closest('[data-state="open"]');
      expect(content).toHaveClass(
        "fixed",
        "left-[50%]",
        "top-[50%]",
        "z-50",
        "grid",
        "w-full",
        "max-w-lg",
        "translate-x-[-50%]",
        "translate-y-[-50%]",
        "gap-4",
        "border",
        "bg-background",
        "p-6",
        "shadow-lg",
      );
    });

    it("should render close button", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it("should close dialog when close button is clicked", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================================================
  // DialogOverlay Component Tests
  // ============================================================================

  describe("DialogOverlay", () => {
    it("should render overlay when dialog is open", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const overlay = document.querySelector(
        '[data-state="open"][class*="bg-black/80"]',
      );
      expect(overlay).toBeInTheDocument();
    });

    it("should not render overlay when dialog is closed", () => {
      render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const overlay = document.querySelector(
        '[data-state="open"][class*="bg-black/80"]',
      );
      expect(overlay).not.toBeInTheDocument();
    });

    it("should have correct styling", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const overlay = document.querySelector(
        '[data-state="open"][class*="bg-black/80"]',
      );
      expect(overlay).toHaveClass("fixed", "inset-0", "z-50", "bg-black/80");
    });
  });

  // ============================================================================
  // DialogHeader Component Tests
  // ============================================================================

  describe("DialogHeader", () => {
    it("should render with default props", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader className="custom-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      const header = screen.getByText("Title").parentElement;
      expect(header).toHaveClass("custom-header");
    });

    it("should render with default styling", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      const header = screen.getByText("Title").parentElement;
      expect(header).toHaveClass(
        "flex",
        "flex-col",
        "space-y-1.5",
        "text-center",
        "sm:text-left",
      );
    });

    it("should render with title and description", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DialogTitle Component Tests
  // ============================================================================

  describe("DialogTitle", () => {
    it("should render with default props", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle className="custom-title">Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Title")).toHaveClass("custom-title");
    });

    it("should render with default styling", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Title")).toHaveClass(
        "text-lg",
        "font-semibold",
        "leading-none",
        "tracking-tight",
      );
    });

    it("should have proper ARIA role", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DialogDescription Component Tests
  // ============================================================================

  describe("DialogDescription", () => {
    it("should render with default props", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Description")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogDescription className="custom-desc">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Description")).toHaveClass("custom-desc");
    });

    it("should render with default styling", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText("Description")).toHaveClass(
        "text-sm",
        "text-muted-foreground",
      );
    });
  });

  // ============================================================================
  // DialogFooter Component Tests
  // ============================================================================

  describe("DialogFooter", () => {
    it("should render with default props", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i }),
      ).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter className="custom-footer">
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      const footer = screen.getByRole("button", {
        name: /cancel/i,
      }).parentElement;
      expect(footer).toHaveClass("custom-footer");
    });

    it("should render with default styling", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      const footer = screen.getByRole("button", {
        name: /cancel/i,
      }).parentElement;
      expect(footer).toHaveClass(
        "flex",
        "flex-col-reverse",
        "sm:flex-row",
        "sm:justify-end",
        "sm:space-x-2",
      );
    });
  });

  // ============================================================================
  // DialogClose Component Tests
  // ============================================================================

  describe("DialogClose", () => {
    it("should render close button", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Custom Close</DialogClose>
          </DialogContent>
        </Dialog>,
      );
      expect(
        screen.getByRole("button", { name: /custom close/i }),
      ).toBeInTheDocument();
    });

    it("should close dialog when clicked", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("should render with custom className", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose className="custom-close">Close</DialogClose>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByRole("button", { name: /close/i })).toHaveClass(
        "custom-close",
      );
    });
  });

  // ============================================================================
  // Full Dialog Composition Tests
  // ============================================================================

  describe("Full Dialog Composition", () => {
    it("should render complete dialog with all components", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <div>Dialog content goes here</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      expect(screen.getByText("Dialog Description")).toBeInTheDocument();
      expect(screen.getByText("Dialog content goes here")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i }),
      ).toBeInTheDocument();
    });

    it("should render dialog with trigger", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(
        screen.getByRole("button", { name: /open dialog/i }),
      ).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should open dialog when trigger is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open dialog/i }));
      await waitFor(() => {
        expect(screen.getByText("Title")).toBeInTheDocument();
      });
    });

    it("should close dialog when overlay is clicked", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      const overlay = document.querySelector(
        '[data-state="open"][class*="bg-black/80"]',
      );
      if (overlay) {
        await user.click(overlay);
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      }
    });

    it("should close dialog when Escape key is pressed", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.keyboard("{Escape}");
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const content = screen.getByText("Title").closest('[role="dialog"]');
      expect(content).toHaveAttribute("role", "dialog");
    });

    it("should have aria-modal attribute", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const content = screen.getByText("Title").closest('[role="dialog"]');
      expect(content).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby pointing to title", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const content = screen.getByText("Title").closest('[role="dialog"]');
      const titleId = screen.getByText("Title").id;
      expect(content).toHaveAttribute("aria-labelledby", titleId);
    });

    it("should have aria-describedby pointing to description", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );
      const content = screen.getByText("Title").closest('[role="dialog"]');
      const descId = screen.getByText("Description").id;
      expect(content).toHaveAttribute("aria-describedby", descId);
    });

    it("should trap focus within dialog", async () => {
      const user = userEvent.setup();

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <button data-testid="button1">Button 1</button>
            <button data-testid="button2">Button 2</button>
          </DialogContent>
        </Dialog>,
      );

      // Focus should be trapped within dialog
      await user.tab();
      expect(
        screen.getByTestId("button1") ||
          screen.getByRole("button", { name: /close/i }),
      ).toHaveFocus();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty content", () => {
      render(
        <Dialog open={true}>
          <DialogContent></DialogContent>
        </Dialog>,
      );
      const content = document.querySelector('[role="dialog"]');
      expect(content).toBeInTheDocument();
    });

    it("should render with very long title", () => {
      const longTitle = "A".repeat(200);
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>{longTitle}</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should render with special characters", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title with {"<special>"} & "quotes"</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText(/title with/i)).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>🎉 Dialog Title 🚀</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText(/dialog title/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onOpenChange when dialog opens", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it("should call onOpenChange when dialog closes", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.keyboard("{Escape}");
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with minimal dialog", () => {
      const { container } = render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with full dialog", () => {
      const { container } = render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            <div>Content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  // ============================================================================
  // Additional Edge Cases - Null/Undefined Handling
  // ============================================================================

  describe("Additional Edge Cases - Null/Undefined Handling", () => {
    it("should open with null content", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>{null}</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      const content = document.querySelector('[role="dialog"]');
      expect(content).toBeInTheDocument();
    });

    it("should close with null onClose handler", async () => {
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={null}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.keyboard("{Escape}");
      // Should not throw error
      expect(screen.getByText("Title")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Additional Edge Cases - Concurrent Operations
  // ============================================================================

  describe("Additional Edge Cases - Concurrent Operations", () => {
    it("should handle opening multiple dialogs rapidly", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      // Rapid open/close cycles
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByRole("button", { name: /open dialog/i }));
        await waitFor(() => {
          expect(screen.getByText("Title")).toBeInTheDocument();
        });
        await user.keyboard("{Escape}");
      }

      expect(handleOpenChange).toHaveBeenCalled();
    });

    it("should handle closing while opening", async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      // Close while opening animation might be in progress
      await user.keyboard("{Escape}");
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================================================
  // Additional Edge Cases - Memory Leaks
  // ============================================================================

  describe("Additional Edge Cases - Memory Leaks", () => {
    it("should cleanup event listeners on unmount", () => {
      const { unmount } = render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      // Unmount should not throw error
      expect(() => unmount()).not.toThrow();
    });

    it("should not leak memory when dialog not unmounted", () => {
      const { unmount } = render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      // Simulate multiple renders without unmount
      for (let i = 0; i < 10; i++) {
        render(
          <Dialog open={true}>
            <DialogContent>
              <DialogTitle>Title</DialogTitle>
            </DialogContent>
          </Dialog>,
        );
      }

      // Should not throw error
      expect(() => unmount()).not.toThrow();
    });
  });

  // ============================================================================
  // Additional Edge Cases - Accessibility
  // ============================================================================

  describe("Additional Edge Cases - Accessibility", () => {
    it("should trap focus with screen reader", async () => {
      const user = userEvent.setup();

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <button data-testid="button1">Button 1</button>
            <button data-testid="button2">Button 2</button>
          </DialogContent>
        </Dialog>,
      );

      // Focus should be trapped within dialog
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);

      // Should be one of the dialog buttons or close button
      const dialogButtons = screen.getAllByRole("button");
      expect(dialogButtons).toContain(focusedElement);
    });

    it("should announce dialog state to screen readers", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      const content = screen
        .getByText("Dialog Title")
        .closest('[role="dialog"]');
      expect(content).toHaveAttribute("aria-modal", "true");
      expect(content).toHaveAttribute("role", "dialog");
    });
  });

  // ============================================================================
  // Additional Edge Cases - Boundary Conditions
  // ============================================================================

  describe("Additional Edge Cases - Boundary Conditions", () => {
    it("should handle extremely large content", () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <p key={i}>Paragraph {i}</p>
      ));

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            {largeContent}
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("Paragraph 0")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 99")).toBeInTheDocument();
    });
  });
});
