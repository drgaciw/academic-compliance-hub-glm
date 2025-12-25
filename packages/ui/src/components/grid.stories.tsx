import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent } from "@storybook/test";
import { expect } from "@storybook/test";
import { Grid } from "./grid";

const meta = {
  title: "Components/Layout/Grid",
  component: Grid,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof Grid>;

export const SingleColumn: Story = {
  args: {
    cols: 1,
    gap: 4,
    children: Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-24 rounded bg-primary/90 p-4 text-primary-foreground"
      >
        Item {i + 1}
      </div>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Item \d/);
    await expect(items).toHaveLength(6);
  },
};

export const ThreeColumns: Story = {
  args: {
    cols: 3,
    gap: 4,
    children: Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-24 rounded bg-primary/90 p-4 text-primary-foreground"
      >
        Item {i + 1}
      </div>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Item \d/);
    await expect(items).toHaveLength(6);
  },
};

export const Responsive: Story = {
  args: {
    cols: 1,
    sm: 2,
    md: 3,
    lg: 4,
    gap: 4,
    children: Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-24 rounded bg-primary/90 p-4 text-primary-foreground"
      >
        Item {i + 1}
      </div>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Item \d/);
    await expect(items).toHaveLength(8);
  },
};

export const FullWidth: Story = {
  args: {
    cols: 12,
    gap: 4,
    children: Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="h-24 rounded bg-primary/90 p-4 text-primary-foreground"
      >
        Item {i + 1}
      </div>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Item \d/);
    await expect(items).toHaveLength(4);
  },
};

export const WithInteractiveElements: Story = {
  args: {
    cols: 2,
    gap: 4,
    children: Array.from({ length: 4 }).map((_, i) => (
      <button
        key={i}
        type="button"
        className="h-24 rounded bg-primary p-4 text-primary-foreground hover:bg-primary/90"
      >
        Interactive Item {i + 1}
      </button>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(4);

    if (buttons[0]) {
      await userEvent.click(buttons[0]);
      await expect(buttons[0]).toHaveFocus();
    }

    if (buttons[1]) {
      await userEvent.tab();
      await expect(buttons[1]).toHaveFocus();
    }
  },
};
