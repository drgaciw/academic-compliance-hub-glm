import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";

import { Button } from "../src/components/button";
import { Input } from "../src/components/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../src/components/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../src/components/dialog";
import { Label } from "../src/components/label";
import { Badge } from "../src/components/badge";

expect.extend(toHaveNoViolations);

describe("Accessibility - Tier 1 Components", () => {
  describe("Button", () => {
    it("should have no accessibility violations for default button", async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for destructive button", async () => {
      const { container } = render(
        <Button variant="destructive">Delete</Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for outline button", async () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for secondary button", async () => {
      const { container } = render(
        <Button variant="secondary">Secondary</Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for ghost button", async () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for link button", async () => {
      const { container } = render(<Button variant="link">Link</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for icon button", async () => {
      const { container } = render(
        <Button size="icon" aria-label="Settings">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for disabled button", async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for different sizes", async () => {
      const { container } = render(
        <div>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Input", () => {
    it("should have no accessibility violations for default input", async () => {
      const { container } = render(<Input placeholder="Enter text" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for input with label", async () => {
      const { container } = render(
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for disabled input", async () => {
      const { container } = render(<Input disabled placeholder="Disabled" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for different input types", async () => {
      const { container } = render(
        <div>
          <Input type="text" placeholder="Text" />
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Input type="number" placeholder="Number" />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Card", () => {
    it("should have no accessibility violations for basic card", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>Card content goes here</CardContent>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for card with footer", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for interactive card elements", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>With clickable elements</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Click me</Button>
          </CardContent>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Dialog", () => {
    it("should have no accessibility violations for dialog when closed", async () => {
      const { container } = render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description text</DialogDescription>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for dialog when open", async () => {
      const { container } = render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description text</DialogDescription>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Label", () => {
    it("should have no accessibility violations for label", async () => {
      const { container } = render(
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for multiple labels", async () => {
      const { container } = render(
        <div>
          <Label htmlFor="field1">Field 1</Label>
          <Input id="field1" />
          <Label htmlFor="field2">Field 2</Label>
          <Input id="field2" />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Badge", () => {
    it("should have no accessibility violations for default badge", async () => {
      const { container } = render(<Badge>Default</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for all badge variants", async () => {
      const { container } = render(
        <div>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Component Integration", () => {
    it("should have no accessibility violations for complex form", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Form Example</CardTitle>
            <CardDescription>Fill in your details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your email" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Input id="message" placeholder="Your message" />
              </div>
              <Badge variant="success">Ready to submit</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for dialog with form", async () => {
      const { container } = render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-name">Name</Label>
                <Input id="profile-name" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="Your email"
                />
              </div>
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </div>
          </DialogContent>
        </Dialog>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
