import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent } from "@storybook/test";
import { expect } from "@storybook/test";
import { Stack } from "./stack";

const meta = {
  title: "Components/Layout/Stack",
  component: Stack,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof Stack>;

export const Vertical: Story = {
  args: {
    direction: "col",
    gap: 4,
    children: (
      <>
        <div className="h-12 w-full rounded bg-primary p-4 text-primary-foreground">
          Item 1
        </div>
        <div className="h-12 w-full rounded bg-primary/90 p-4 text-primary-foreground">
          Item 2
        </div>
        <div className="h-12 w-full rounded bg-primary/80 p-4 text-primary-foreground">
          Item 3
        </div>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Item \d/);
    await expect(items).toHaveLength(3);
  },
};

export const Horizontal: Story = {
  args: {
    direction: "row",
    gap: 4,
    children: (
      <>
        <div className="h-12 w-24 rounded bg-primary p-4 text-primary-foreground">
          Item 1
        </div>
        <div className="h-12 w-24 rounded bg-primary/90 p-4 text-primary-foreground">
          Item 2
        </div>
        <div className="h-12 w-24 rounded bg-primary/80 p-4 text-primary-foreground">
          Item 3
        </div>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Item \d/);
    await expect(items).toHaveLength(3);
  },
};

export const Centered: Story = {
  args: {
    direction: "col",
    gap: 4,
    align: "center",
    justify: "center",
    children: (
      <>
        <div className="h-12 w-48 rounded bg-primary p-4 text-primary-foreground">
          Centered Item 1
        </div>
        <div className="h-12 w-48 rounded bg-primary/90 p-4 text-primary-foreground">
          Centered Item 2
        </div>
        <div className="h-12 w-48 rounded bg-primary/80 p-4 text-primary-foreground">
          Centered Item 3
        </div>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByText(/Centered Item \d/);
    await expect(items).toHaveLength(3);
  },
};

export const GapSizes: Story = {
  args: {
    direction: "col",
    children: (
      <>
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">Gap: 2</div>
          <Stack gap={2} direction="row">
            <div className="h-8 w-16 rounded bg-secondary">A</div>
            <div className="h-8 w-16 rounded bg-secondary">B</div>
            <div className="h-8 w-16 rounded bg-secondary">C</div>
          </Stack>
        </div>
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">Gap: 8</div>
          <Stack gap={8} direction="row">
            <div className="h-8 w-16 rounded bg-secondary">A</div>
            <div className="h-8 w-16 rounded bg-secondary">B</div>
            <div className="h-8 w-16 rounded bg-secondary">C</div>
          </Stack>
        </div>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gapLabels = canvas.getAllByText(/Gap: \d/);
    await expect(gapLabels).toHaveLength(2);
    const letters = canvas.getAllByText(/[ABC]/);
    await expect(letters).toHaveLength(6);
  },
};

export const KeyboardNavigation: Story = {
  args: {
    direction: "row",
    gap: 4,
    children: (
      <>
        <button type="button" className="rounded bg-primary p-4">
          Button 1
        </button>
        <button type="button" className="rounded bg-primary p-4">
          Button 2
        </button>
        <button type="button" className="rounded bg-primary p-4">
          Button 3
        </button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(3);

    await userEvent.tab();
    await expect(buttons[0]).toHaveFocus();

    await userEvent.tab();
    await expect(buttons[1]).toHaveFocus();

    await userEvent.tab();
    await expect(buttons[2]).toHaveFocus();
  },
};
