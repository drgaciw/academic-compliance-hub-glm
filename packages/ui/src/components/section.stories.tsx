import type { Meta, StoryObj } from "@storybook/react"
import { Section } from "./section"

const meta = {
  title: "Components/Layout/Section",
  component: Section,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof Section>

export const Default: Story = {
  args: {
    maxWidth: "lg",
    children: (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">Section Title</h1>
        <p className="text-muted-foreground">
          This is a centered section with max-width constraint.
        </p>
        <div className="rounded-lg bg-muted p-4">
          Content inside the section
        </div>
      </div>
    ),
  },
}

export const SmallWidth: Story = {
  args: {
    maxWidth: "sm",
    children: (
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Small Section</h1>
        <p className="text-muted-foreground">
          This section has a small max-width (max-w-sm).
        </p>
      </div>
    ),
  },
}

export const LargeWidth: Story = {
  args: {
    maxWidth: "4xl",
    children: (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">Large Section</h1>
        <p className="text-muted-foreground">
          This section has a large max-width (max-w-4xl).
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted p-4">Column 1</div>
          <div className="rounded-lg bg-muted p-4">Column 2</div>
        </div>
      </div>
    ),
  },
}

export const NotCentered: Story = {
  args: {
    maxWidth: "md",
    centered: false,
    className: "bg-muted",
    children: (
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Non-Centered Section</h1>
        <p className="text-muted-foreground">
          This section has max-width but is not centered.
        </p>
      </div>
    ),
  },
}
