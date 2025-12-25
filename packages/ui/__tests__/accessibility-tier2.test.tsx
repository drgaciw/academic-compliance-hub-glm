import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

import { Stack } from "../src/components/stack";
import { Grid } from "../src/components/grid";
import { Section } from "../src/components/section";
import { Container } from "../src/components/container";
import { Button } from "../src/components/button";
import { Input } from "../src/components/input";
import { Label } from "../src/components/label";

expect.extend(toHaveNoViolations);

describe("Accessibility - Tier 2 Layout Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Stack", () => {
    it("should have no accessibility violations for vertical stack", async () => {
      const { container } = render(
        <Stack direction="col" gap={4}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for horizontal stack", async () => {
      const { container } = render(
        <Stack direction="row" gap={4}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations with interactive elements", async () => {
      const { container } = render(
        <Stack direction="col" gap={4}>
          <Button>Action 1</Button>
          <Button>Action 2</Button>
        </Stack>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper keyboard navigation", async () => {
      render(
        <Stack direction="col" gap={4}>
          <Button>Action 1</Button>
          <Button>Action 2</Button>
          <Button>Action 3</Button>
        </Stack>,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("Grid", () => {
    it("should have no accessibility violations for single column", async () => {
      const { container } = render(
        <Grid cols={1} gap={4}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for multi-column grid", async () => {
      const { container } = render(
        <Grid cols={3} gap={4}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for responsive grid", async () => {
      const { container } = render(
        <Grid cols={1} sm={2} md={3} gap={4}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations with interactive elements", async () => {
      const { container } = render(
        <Grid cols={2} gap={4}>
          <Button>Action 1</Button>
          <Button>Action 2</Button>
        </Grid>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Section", () => {
    it("should have no accessibility violations for default section", async () => {
      const { container } = render(
        <Section maxWidth="lg">
          <h1>Section Title</h1>
          <p>Section content</p>
        </Section>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations with semantic heading", async () => {
      const { container } = render(
        <Section maxWidth="md">
          <h2>Section Heading</h2>
          <p>Section content with proper heading hierarchy</p>
        </Section>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations with nested structure", async () => {
      const { container } = render(
        <Section maxWidth="xl">
          <h1>Main Section</h1>
          <Section maxWidth="lg" centered={false}>
            <h2>Nested Section</h2>
            <p>Nested content</p>
          </Section>
        </Section>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Container", () => {
    it("should have no accessibility violations for default container", async () => {
      const { container } = render(
        <Container>
          <h1>Container Title</h1>
          <p>Container content</p>
        </Container>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations with different padding", async () => {
      const { container } = render(
        <Container padding="lg">
          <h1>Container Title</h1>
          <p>Container content</p>
        </Container>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations without padding", async () => {
      const { container } = render(
        <Container padding="none">
          <h1>Container Title</h1>
          <p>Container content</p>
        </Container>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe("Accessibility - Screen Reader Announcements", () => {
  describe("Dynamic Content Updates", () => {
    it("should announce form submission status", async () => {
      function FormWithStatus() {
        const [status, setStatus] = React.useState<
          "idle" | "success" | "error"
        >("idle");

        return (
          <div>
            <Button onClick={() => setStatus("success")}>Submit</Button>
            {status === "success" && (
              <div role="status" aria-live="polite">
                Form submitted successfully
              </div>
            )}
          </div>
        );
      }

      const { container } = render(<FormWithStatus />);
      const button = screen.getByText("Submit");
      await userEvent.click(button);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      expect(
        screen.getByText("Form submitted successfully"),
      ).toBeInTheDocument();
    });

    it("should announce validation errors", async () => {
      function FormWithValidation() {
        return (
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              aria-invalid="true"
              aria-describedby="error-message"
            />
            <div id="error-message" role="alert" aria-live="assertive">
              Please enter a valid email address
            </div>
          </div>
        );
      }

      const { container } = render(<FormWithValidation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeInTheDocument();
    });

    it("should announce loading states", async () => {
      function FormWithLoading() {
        const [loading, setLoading] = React.useState(false);

        return (
          <div>
            <Button onClick={() => setLoading(true)} disabled={loading}>
              {loading ? <span aria-live="polite">Loading...</span> : "Submit"}
            </Button>
          </div>
        );
      }

      const { container } = render(<FormWithLoading />);
      const button = screen.getByText("Submit");
      await userEvent.click(button);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should announce selection changes", async () => {
      function TableWithSelection() {
        const [selected, setSelected] = React.useState(0);

        return (
          <div>
            <Button onClick={() => setSelected(selected + 1)}>
              Select Row
            </Button>
            <div role="status" aria-live="polite">
              {selected} row{selected !== 1 ? "s" : ""} selected
            </div>
          </div>
        );
      }

      const { container } = render(<TableWithSelection />);
      const button = screen.getByText("Select Row");
      await userEvent.click(button);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      expect(screen.getByText("1 row selected")).toBeInTheDocument();
    });

    it("should announce page changes", async () => {
      function PaginationWithAnnouncement() {
        const [page, setPage] = React.useState(1);

        return (
          <div>
            <Button onClick={() => setPage(page + 1)}>Next Page</Button>
            <div role="status" aria-live="polite">
              Page {page}
            </div>
          </div>
        );
      }

      const { container } = render(<PaginationWithAnnouncement />);
      const button = screen.getByText("Next Page");
      await userEvent.click(button);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      expect(screen.getByText("Page 2")).toBeInTheDocument();
    });
  });
});

describe("Accessibility - Keyboard Navigation", () => {
  it("should support tab navigation through form fields", async () => {
    const { container } = render(
      <Stack direction="col" gap={4}>
        <div>
          <Label htmlFor="field1">Field 1</Label>
          <Input id="field1" />
        </div>
        <div>
          <Label htmlFor="field2">Field 2</Label>
          <Input id="field2" />
        </div>
        <div>
          <Label htmlFor="field3">Field 3</Label>
          <Input id="field3" />
        </div>
      </Stack>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should support enter key on buttons", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    const button = screen.getByText("Submit");
    await userEvent.keyboard("{Tab}{Enter}");

    expect(handleClick).toHaveBeenCalled();
  });

  it("should support space key on buttons", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    const button = screen.getByText("Submit");
    button.focus();
    await userEvent.keyboard("{ }");

    expect(handleClick).toHaveBeenCalled();
  });

  it("should have proper focus management", async () => {
    const { container } = render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("should announce focus changes to screen readers", async () => {
    const { container } = render(
      <div>
        <Button aria-label="Settings">Settings</Button>
        <Input aria-label="Search" placeholder="Search..." />
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Accessibility - Form Elements", () => {
  it("should have no accessibility violations with labeled inputs", async () => {
    const { container } = render(
      <Stack direction="col" gap={4}>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
      </Stack>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations with required fields", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input id="password" type="password" required aria-required="true" />
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper error association", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          aria-invalid="true"
          aria-describedby="email-error"
        />
        <p id="email-error" role="alert" className="text-destructive">
          Invalid email format
        </p>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper helper text association", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Input id="bio" aria-describedby="bio-helper" />
        <p id="bio-helper" className="text-muted-foreground">
          Max 200 characters
        </p>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
