import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Button } from "../components/button";
import { fn } from "@storybook/test";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
  },
  args: {
    onClick: fn(),
    children: "Button",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: React.createElement(
      "svg",
      {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
      React.createElement("circle", { cx: "12", cy: "12", r: "3" }),
      React.createElement("path", {
        d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
      }),
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () =>
    React.createElement(
      "div",
      { style: { display: "flex", gap: "16px", flexWrap: "wrap" } },
      React.createElement(Button, { variant: "default" }, "Default"),
      React.createElement(Button, { variant: "destructive" }, "Destructive"),
      React.createElement(Button, { variant: "outline" }, "Outline"),
      React.createElement(Button, { variant: "secondary" }, "Secondary"),
      React.createElement(Button, { variant: "ghost" }, "Ghost"),
      React.createElement(Button, { variant: "link" }, "Link"),
    ),
};

export const AllSizes: Story = {
  render: () =>
    React.createElement(
      "div",
      { style: { display: "flex", gap: "16px", alignItems: "center" } },
      React.createElement(
        Button,
        { size: "icon-sm" },
        React.createElement(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
          },
          React.createElement("circle", { cx: "12", cy: "12", r: "3" }),
        ),
      ),
      React.createElement(Button, { size: "sm" }, "Small"),
      React.createElement(Button, null, "Default"),
      React.createElement(Button, { size: "lg" }, "Large"),
      React.createElement(
        Button,
        { size: "icon" },
        React.createElement(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
          },
          React.createElement("circle", { cx: "12", cy: "12", r: "3" }),
        ),
      ),
      React.createElement(
        Button,
        { size: "icon-lg" },
        React.createElement(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
          },
          React.createElement("circle", { cx: "12", cy: "12", r: "3" }),
        ),
      ),
    ),
};
