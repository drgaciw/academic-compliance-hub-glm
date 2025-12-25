import type { Meta, StoryObj } from "@storybook/react"
import { Container } from "./container"

const meta = {
  title: "Components/Layout/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {
  args: {
    padding: "md",
    children: (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Default Container</h1>
        <p className="text-muted-foreground">
          This container has default padding (p-6).
        </p>
        <div className="rounded-lg bg-primary/10 p-4">Content inside</div>
      </div>
    ),
  },
}

export const SmallPadding: Story = {
  args: {
    padding: "sm",
    children: (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Small Padding</h1>
        <p className="text-muted-foreground">This container has small padding (p-4).</p>
      </div>
    ),
  },
}

export const LargePadding: Story = {
  args: {
    padding: "xl",
    children: (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Large Padding</h1>
        <p className="text-muted-foreground">This container has large padding (p-12).</p>
      </div>
    ),
  },
}

export const NoPadding: Story = {
  args: {
    padding: "none",
    className: "bg-muted",
    children: (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">No Padding</h1>
        <p className="text-muted-foreground">This container has no padding.</p>
      </div>
    ),
  },
}
