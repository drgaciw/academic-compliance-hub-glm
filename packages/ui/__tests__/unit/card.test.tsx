/**
 * Card Component Unit Tests
 *
 * Comprehensive unit tests for the Card component covering:
 * - Rendering with default props
 * - Rendering with all sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction)
 * - User interactions
 * - Accessibility attributes (ARIA roles, labels)
 * - Edge cases (empty states, nested content)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/card";

describe("Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Card Root Component Tests
  // ============================================================================

  describe("Card Root", () => {
    it("should render with default props", () => {
      const { container } = render(<Card>Card content</Card>);
      const card = container.querySelector('[data-slot="card"]');
      expect(screen.getByText("Card content")).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
    });

    it("should render with custom className", () => {
      const { container } = render(
        <Card className="custom-card">Content</Card>,
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass("custom-card");
    });

    it("should render with default styling", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass(
        "bg-card",
        "text-card-foreground",
        "flex",
        "flex-col",
        "gap-6",
        "rounded-xl",
        "border",
        "py-6",
        "shadow-sm",
      );
    });

    it("should render with additional HTML attributes", () => {
      render(
        <Card id="test-card" data-testid="test-card">
          Content
        </Card>,
      );
      const card = screen.getByTestId("test-card");
      expect(card).toHaveAttribute("id", "test-card");
      expect(card).toHaveAttribute("data-slot", "card");
    });

    it("should render with nested elements", () => {
      render(
        <Card>
          <div data-testid="nested">Nested content</div>
        </Card>,
      );
      expect(screen.getByTestId("nested")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardHeader Component Tests
  // ============================================================================

  describe("CardHeader", () => {
    it("should render with default props", () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>,
      );
      const header = screen.getByText("Header content");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("data-slot", "card-header");
    });

    it("should render with custom className", () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>,
      );
      const header = screen.getByText("Header");
      expect(header).toHaveClass("custom-header");
    });

    it("should render with default styling", () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>,
      );
      const header = screen.getByText("Header");
      expect(header).toHaveClass(
        "@container/card-header",
        "grid",
        "auto-rows-min",
        "grid-rows-[auto_auto]",
        "items-start",
        "gap-2",
        "px-6",
      );
    });

    it("should render with CardTitle and CardDescription", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardTitle Component Tests
  // ============================================================================

  describe("CardTitle", () => {
    it("should render with default props", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      const title = screen.getByText("Card Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("data-slot", "card-title");
    });

    it("should render with custom className", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      const title = screen.getByText("Title");
      expect(title).toHaveClass("custom-title");
    });

    it("should render with default styling", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      const title = screen.getByText("Title");
      expect(title).toHaveClass("leading-none", "font-semibold");
    });

    it("should render with long text", () => {
      const longTitle = "A".repeat(200);
      render(
        <Card>
          <CardHeader>
            <CardTitle>{longTitle}</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardDescription Component Tests
  // ============================================================================

  describe("CardDescription", () => {
    it("should render with default props", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      const description = screen.getByText("Card Description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute("data-slot", "card-description");
    });

    it("should render with custom className", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="custom-desc">
              Description
            </CardDescription>
          </CardHeader>
        </Card>,
      );
      const description = screen.getByText("Description");
      expect(description).toHaveClass("custom-desc");
    });

    it("should render with default styling", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      const description = screen.getByText("Description");
      expect(description).toHaveClass("text-muted-foreground", "text-sm");
    });

    it("should render with multiline text", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Line 1 Line 2 Line 3</CardDescription>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText(/line 1/i)).toBeInTheDocument();
      expect(screen.getByText(/line 2/i)).toBeInTheDocument();
      expect(screen.getByText(/line 3/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardAction Component Tests
  // ============================================================================

  describe("CardAction", () => {
    it("should render with default props", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>Action</CardAction>
          </CardHeader>
        </Card>,
      );
      const action = screen.getByText("Action");
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute("data-slot", "card-action");
    });

    it("should render with custom className", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction className="custom-action">Action</CardAction>
          </CardHeader>
        </Card>,
      );
      const action = screen.getByText("Action");
      expect(action).toHaveClass("custom-action");
    });

    it("should render with default positioning", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>Action</CardAction>
          </CardHeader>
        </Card>,
      );
      const action = screen.getByText("Action");
      expect(action).toHaveClass(
        "col-start-2",
        "row-span-2",
        "row-start-1",
        "self-start",
        "justify-self-end",
      );
    });

    it("should render with button as action", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>
              <button data-testid="action-button">Action</button>
            </CardAction>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByTestId("action-button")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardContent Component Tests
  // ============================================================================

  describe("CardContent", () => {
    it("should render with default props", () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>,
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-slot", "card-content");
    });

    it("should render with custom className", () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>,
      );
      const content = screen.getByText("Content");
      expect(content).toHaveClass("custom-content");
    });

    it("should render with default styling", () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>,
      );
      const content = screen.getByText("Content");
      expect(content).toHaveClass("px-6");
    });

    it("should render with nested elements", () => {
      render(
        <Card>
          <CardContent>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </CardContent>
        </Card>,
      );
      expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardFooter Component Tests
  // ============================================================================

  describe("CardFooter", () => {
    it("should render with default props", () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );
      const footer = screen.getByText("Footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute("data-slot", "card-footer");
    });

    it("should render with custom className", () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>,
      );
      const footer = screen.getByText("Footer");
      expect(footer).toHaveClass("custom-footer");
    });

    it("should render with default styling", () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );
      const footer = screen.getByText("Footer");
      expect(footer).toHaveClass("flex", "items-center", "px-6");
    });

    it("should render with buttons", () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Submit</button>
          </CardFooter>
        </Card>,
      );
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i }),
      ).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Full Card Composition Tests
  // ============================================================================

  describe("Full Card Composition", () => {
    it("should render complete card with all components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button data-testid="action-btn">Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Cancel</button>
            <button>Submit</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByTestId("action-btn")).toBeInTheDocument();
      expect(screen.getByText("Card content goes here")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i }),
      ).toBeInTheDocument();
    });

    it("should render card without header", () => {
      render(
        <Card>
          <CardContent>Content only</CardContent>
        </Card>,
      );
      expect(screen.getByText("Content only")).toBeInTheDocument();
    });

    it("should render card without footer", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>,
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render card with multiple content sections", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Section 1</p>
          </CardContent>
          <CardContent>
            <p>Section 2</p>
          </CardContent>
        </Card>,
      );
      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Section 2")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe("Interactions", () => {
    it("should handle click events on card", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Card onClick={handleClick} data-testid="clickable-card">
          Content
        </Card>,
      );
      await user.click(screen.getByTestId("clickable-card"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle click events on card action button", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>
              <button onClick={handleClick}>Action</button>
            </CardAction>
          </CardHeader>
        </Card>,
      );
      await user.click(screen.getByRole("button", { name: /action/i }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle click events on footer buttons", async () => {
      const handleCancel = vi.fn();
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Card>
          <CardFooter>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleSubmit}>Submit</button>
          </CardFooter>
        </Card>,
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));
      await user.click(screen.getByRole("button", { name: /submit/i }));

      expect(handleCancel).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe("Accessibility", () => {
    it("should support aria-label on card", () => {
      render(<Card aria-label="Information card">Content</Card>);
      const card = screen.getByLabelText("Information card");
      expect(card).toBeInTheDocument();
    });

    it("should support aria-labelledby on card", () => {
      render(
        <Card aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      const { container } = render(
        <Card aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveAttribute("aria-labelledby", "card-title");
    });

    it("should support aria-describedby on card", () => {
      render(
        <Card aria-describedby="card-desc">
          <CardHeader>
            <CardDescription id="card-desc">Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      const { container } = render(
        <Card aria-describedby="card-desc">
          <CardHeader>
            <CardDescription id="card-desc">Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveAttribute("aria-describedby", "card-desc");
    });

    it("should support role attribute", () => {
      render(<Card role="article">Content</Card>);
      const { container } = render(<Card role="article">Content</Card>);
      const card = container.querySelector('[role="article"]');
      expect(card).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should render with empty content", () => {
      const { container } = render(<Card></Card>);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it("should render with whitespace content", () => {
      const { container } = render(<Card> </Card>);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it("should render with very long content", () => {
      const longContent = "A".repeat(10000);
      render(
        <Card>
          <CardContent>{longContent}</CardContent>
        </Card>,
      );
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it("should render with special characters", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title with {"<special>"} & "quotes"</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText(/title with/i)).toBeInTheDocument();
    });

    it("should render with emoji", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>🎉 Card Title 🚀</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText(/card title/i)).toBeInTheDocument();
    });

    it("should handle deeply nested content", () => {
      render(
        <Card>
          <CardContent>
            <div>
              <div>
                <div>
                  <p>Deeply nested content</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>,
      );
      expect(screen.getByText("Deeply nested content")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Event Handler Tests
  // ============================================================================

  describe("Event Handlers", () => {
    it("should call onMouseEnter handler", async () => {
      const handleMouseEnter = vi.fn();
      const user = userEvent.setup();

      render(
        <Card onMouseEnter={handleMouseEnter} data-testid="hover-card">
          Content
        </Card>,
      );
      await user.hover(screen.getByTestId("hover-card"));

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("should call onMouseLeave handler", async () => {
      const handleMouseLeave = vi.fn();
      const user = userEvent.setup();

      render(
        <Card onMouseLeave={handleMouseLeave} data-testid="hover-card">
          Content
        </Card>,
      );
      const card = screen.getByTestId("hover-card");

      await user.hover(card);
      await user.unhover(card);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe("Snapshots", () => {
    it("should match snapshot with minimal card", () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with full card", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with card action", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
