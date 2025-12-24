/**
 * Dropdown Menu Component Unit Tests
 *
 * Comprehensive unit tests for DropdownMenu component covering:
 * - Rendering with default props
 * - Rendering with all sub-components (DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub)
 * - User interactions (open, close, select, keyboard navigation)
 * - Accessibility attributes (ARIA roles, labels, focus management)
 * - Edge cases (empty states, disabled states)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
} from "@/components/dropdown-menu";

describe("DropdownMenu Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // DropdownMenu Root Component Tests
  // ============================================================================

  describe("DropdownMenu Root", () => {
    it("should render with default props", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(
        screen.getByRole("button", { name: /open menu/i }),
      ).toBeInTheDocument();
    });

    it("should not render content when closed", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // DropdownMenuTrigger Component Tests
  // ============================================================================

  describe("DropdownMenuTrigger", () => {
    it("should render trigger button", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(
        screen.getByRole("button", { name: /open menu/i }),
      ).toBeInTheDocument();
    });

    it("should open menu when clicked", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });
    });

    it("should render with custom className", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger className="custom-trigger">
            Open
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByRole("button")).toHaveClass("custom-trigger");
    });
  });

  // ============================================================================
  // DropdownMenuContent Component Tests
  // ============================================================================

  describe("DropdownMenuContent", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });
    });

    it("should render with custom className", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const content = screen
          .getByText("Item 1")
          .closest('[data-state="open"]');
        expect(content).toHaveClass("custom-content");
      });
    });

    it("should close when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });

      await user.click(document.body);
      await waitFor(() => {
        expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // DropdownMenuItem Component Tests
  // ============================================================================

  describe("DropdownMenuItem", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });
    });

    it("should render with custom className", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-item">Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Item 1")).toHaveClass("custom-item");
      });
    });

    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(async () => {
        const item = screen.getByText("Item 1");
        await user.click(item);
      });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onClick={handleClick}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(async () => {
        const item = screen.getByText("Disabled Item");
        await user.click(item);
      });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should render with inset prop", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const item = screen.getByText("Inset Item");
        expect(item).toHaveClass("pl-8");
      });
    });
  });

  // ============================================================================
  // DropdownMenuCheckboxItem Component Tests
  // ============================================================================

  describe("DropdownMenuCheckboxItem", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={true}>
              Checked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Checked Item")).toBeInTheDocument();
      });
    });

    it("should render check indicator when checked", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={true}>
              Checked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const checkIcon = document.querySelector('[data-state="checked"]');
        expect(checkIcon).toBeInTheDocument();
      });
    });

    it("should not render check indicator when unchecked", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false}>
              Unchecked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const checkIcon = document.querySelector('[data-state="checked"]');
        expect(checkIcon).not.toBeInTheDocument();
      });
    });

    it("should toggle checked state when clicked", async () => {
      const handleCheckedChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={handleCheckedChange}
            >
              Toggle Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(async () => {
        const item = screen.getByText("Toggle Item");
        await user.click(item);
      });

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  // ============================================================================
  // DropdownMenuRadioItem Component Tests
  // ============================================================================

  describe("DropdownMenuRadioItem", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });
    });

    it("should render radio indicator when selected", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const radioIcon = document.querySelector('[data-state="checked"]');
        expect(radioIcon).toBeInTheDocument();
      });
    });

    it("should call onValueChange when clicked", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(async () => {
        const item = screen.getByText("Option 1");
        await user.click(item);
      });

      expect(handleValueChange).toHaveBeenCalledWith("option1");
    });
  });

  // ============================================================================
  // DropdownMenuLabel Component Tests
  // ============================================================================

  describe("DropdownMenuLabel", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Menu Label")).toBeInTheDocument();
      });
    });

    it("should render with custom className", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="custom-label">
              Label
            </DropdownMenuLabel>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Label")).toHaveClass("custom-label");
      });
    });

    it("should render with inset prop", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Inset Label")).toHaveClass("pl-8");
      });
    });
  });

  // ============================================================================
  // DropdownMenuSeparator Component Tests
  // ============================================================================

  describe("DropdownMenuSeparator", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const separator = document.querySelector('[role="separator"]');
        expect(separator).toBeInTheDocument();
      });
    });

    it("should render with custom className", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator className="custom-separator" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const separator = document.querySelector('[role="separator"]');
        expect(separator).toHaveClass("custom-separator");
      });
    });
  });

  // ============================================================================
  // DropdownMenuShortcut Component Tests
  // ============================================================================

  describe("DropdownMenuShortcut", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Item
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("⌘K")).toBeInTheDocument();
      });
    });

    it("should render with custom className", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Item
              <DropdownMenuShortcut className="custom-shortcut">
                ⌘K
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("⌘K")).toHaveClass("custom-shortcut");
      });
    });
  });

  // ============================================================================
  // DropdownMenuSub Component Tests
  // ============================================================================

  describe("DropdownMenuSub", () => {
    it("should render with default props", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Submenu")).toBeInTheDocument();
      });
    });

    it("should open submenu when hovered", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const submenuTrigger = screen.getByText("Submenu");
        await user.hover(submenuTrigger);
      });

      await waitFor(() => {
        expect(screen.getByText("Sub Item 1")).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper ARIA roles", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const content = document.querySelector('[role="menu"]');
        expect(content).toBeInTheDocument();
      });
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        await user.keyboard("{ArrowDown}");
        expect(screen.getByText("Item 2")).toHaveFocus();
      });
    });

    it("should close on Escape key", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty menu", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent></DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        const content = document.querySelector('[role="menu"]');
        expect(content).toBeInTheDocument();
      });
    });

    it("should render with very long text", async () => {
      const user = userEvent.setup();
      const longText = "A".repeat(200);

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{longText}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with minimal menu", () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with full menu", () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={true}>
              Checked Item
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
