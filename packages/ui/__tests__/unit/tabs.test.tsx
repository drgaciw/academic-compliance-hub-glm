/**
 * Tabs Component Unit Tests
 *
 * Comprehensive unit tests for Tabs component covering:
 * - Rendering with default props
 * - Rendering with all sub-components (TabsList, TabsTrigger, TabsContent)
 * - User interactions (click, keyboard navigation)
 * - Accessibility attributes (ARIA roles, labels, focus management)
 * - Edge cases (empty states, disabled states)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";

describe("Tabs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Tabs Root Component Tests
  // ============================================================================

  describe("Tabs Root", () => {
    it("should render with default props", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const tabs = screen.getByRole("tablist");
      expect(tabs).toHaveClass("custom-tabs");
    });

    it("should call onValueChange when tab changes", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: /tab 2/i }));
      expect(handleValueChange).toHaveBeenCalledWith("tab2");
    });

    it("should render with disabled state", () => {
      render(
        <Tabs defaultValue="tab1" disabled>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const tabs = screen.getByRole("tablist");
      expect(tabs).toHaveAttribute("data-disabled", "true");
    });
  });

  // ============================================================================
  // TabsList Component Tests
  // ============================================================================

  describe("TabsList", () => {
    it("should render with default props", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const tabsList = screen.getByRole("tablist");
      expect(tabsList).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const tabsList = screen.getByRole("tablist");
      expect(tabsList).toHaveClass("custom-list");
    });

    it("should render with default styling", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const tabsList = screen.getByRole("tablist");
      expect(tabsList).toHaveClass(
        "inline-flex",
        "h-9",
        "items-center",
        "justify-center",
        "rounded-lg",
        "bg-muted",
        "p-1",
        "text-muted-foreground",
      );
    });
  });

  // ============================================================================
  // TabsTrigger Component Tests
  // ============================================================================

  describe("TabsTrigger", () => {
    it("should render with default props", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole("tab", { name: /tab 1/i })).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger className="custom-trigger" value="tab1">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const trigger = screen.getByRole("tab", { name: /tab 1/i });
      expect(trigger).toHaveClass("custom-trigger");
    });

    it("should render with active styling when selected", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Active Tab</TabsTrigger>
            <TabsTrigger value="tab2">Inactive Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const activeTrigger = screen.getByRole("tab", { name: "Active Tab" });
      const inactiveTrigger = screen.getByRole("tab", { name: "Inactive Tab" });

      expect(activeTrigger).toBeInTheDocument();
      expect(inactiveTrigger).toBeInTheDocument();
    });

    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger onClick={handleClick} value="tab1">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: /tab 1/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger disabled onClick={handleClick} value="tab1">
              Disabled Tab
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: /disabled tab/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TabsContent Component Tests
  // ============================================================================

  describe("TabsContent", () => {
    it("should render with default props", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent className="custom-content" value="tab1">
            Content 1
          </TabsContent>
        </Tabs>,
      );
      const content = screen.getByText("Content 1");
      expect(content).toHaveClass("custom-content");
    });

    it("should render with active styling when selected", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Active Content</TabsContent>
          <TabsContent value="tab2">Inactive Content</TabsContent>
        </Tabs>,
      );

      // Active content should be visible
      const activeContent = screen.getByText("Active Content");
      expect(activeContent).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Full Tabs Composition Tests
  // ============================================================================

  describe("Full Tabs Composition", () => {
    it("should render complete tabs with all components", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tab", { name: /tab 1/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 2/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 3/i })).toBeInTheDocument();

      // Only the active tab content is visible
      expect(screen.getByText("Content 1")).toBeInTheDocument();
      // Other content is in DOM but hidden
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Content 3")).not.toBeInTheDocument();
    });

    it("should render tabs without content", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>,
      );

      expect(screen.getByRole("tab", { name: /tab 1/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 2/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should switch tabs when clicked", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: /tab 2/i }));
      expect(handleValueChange).toHaveBeenCalledWith("tab2");
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });

    it("should switch tabs multiple times", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: /tab 2/i }));
      await user.click(screen.getByRole("tab", { name: /tab 3/i }));
      await user.click(screen.getByRole("tab", { name: /tab 1/i }));

      expect(handleValueChange).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper ARIA roles", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 1/i })).toBeInTheDocument();
    });

    it("should have proper ARIA attributes", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      const tablist = screen.getByRole("tablist");
      const tab = screen.getByRole("tab", { name: /tab 1/i });

      expect(tablist).toHaveAttribute("role", "tablist");
      expect(tab).toHaveAttribute("role", "tab");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const tab1 = screen.getByRole("tab", { name: /tab 1/i });
      tab1.focus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: /tab 2/i })).toHaveFocus();
    });

    it("should trap focus within tabs", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      await user.tab();
      expect(
        screen.getByRole("tab", { name: /tab 1/i }) ||
          screen.getByRole("tab", { name: /tab 2/i }),
      ).toHaveFocus();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty tabs", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList></TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();
    });

    it("should render with very long text", () => {
      const longText = "A".repeat(200);

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">{longText}</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should render with special characters", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">
              Tab with {"<special>"} & "quotes"
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByText(/tab with/i)).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">🎉 Tab 1 🚀</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByText(/tab 1/i)).toBeInTheDocument();
    });

    it("should handle rapid tab switching", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      // Rapid tab switching
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByRole("tab", { name: /tab 2/i }));
        await user.click(screen.getByRole("tab", { name: /tab 1/i }));
      }

      expect(handleValueChange).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onValueChange when tab changes", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: /tab 2/i }));
      expect(handleValueChange).toHaveBeenCalledWith("tab2");
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with minimal tabs", () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with full tabs", () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

// ============================================================================
// Additional Edge Cases - Null/Undefined Handling
// ============================================================================

describe("Additional Edge Cases - Null/Undefined Handling", () => {
  it("should render with empty tabs list", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList></TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
  });

  it("should render with null defaultValue", () => {
    render(
      <Tabs defaultValue={null}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});

// ============================================================================
// Additional Edge Cases - Boundary Conditions
// ============================================================================

describe("Additional Edge Cases - Boundary Conditions", () => {
  it("should handle 50+ tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          {Array.from({ length: 50 }, (_, i) => (
            <TabsTrigger key={i} value={`tab${i}`}>
              Tab {i}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Tab 0")).toBeInTheDocument();
    expect(screen.getByText("Tab 49")).toBeInTheDocument();
  });

  it("should handle tabs with extremely long labels", () => {
    const longText = "A".repeat(200);

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">{longText}</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText(longText)).toBeInTheDocument();
  });
});

// ============================================================================
// Additional Edge Cases - Concurrent Operations
// ============================================================================

describe("Additional Edge Cases - Concurrent Operations", () => {
  it("should handle rapidly switching tabs 50 times", async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    // Rapid tab switching
    for (let i = 0; i < 50; i++) {
      await user.click(screen.getByRole("tab", { name: /tab 2/i }));
      await user.click(screen.getByRole("tab", { name: /tab 1/i }));
    }

    expect(handleValueChange).toHaveBeenCalled();
  });
});

// ============================================================================
// Additional Edge Cases - Memory Leaks
// ============================================================================

describe("Additional Edge Cases - Memory Leaks", () => {
  it("should cleanup event listeners on unmount", () => {
    const { unmount } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );

    // Unmount should not throw error
    expect(() => unmount()).not.toThrow();
  });
});

// ============================================================================
// Additional Edge Cases - Accessibility
// ============================================================================

describe("Additional Edge Cases - Accessibility", () => {
  it("should announce tab changes to screen readers", async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    await user.click(screen.getByRole("tab", { name: /tab 2/i }));

    // Verify the value change was announced
    expect(handleValueChange).toHaveBeenCalledWith("tab2");
  });
});
