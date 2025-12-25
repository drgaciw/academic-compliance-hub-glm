import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "./date-picker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    placeholder: "Pick a date",
    value: undefined,
    onChange: () => {},
  },
};

export const WithLabel: Story = {
  args: {
    placeholder: "Pick a date",
    value: undefined,
    onChange: () => {},
    label: "Select date",
    required: true,
  },
};

export const WithValue: Story = {
  args: {
    placeholder: "Pick a date",
    value: new Date(),
    onChange: () => {},
    label: "Pre-selected date",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Pick a date",
    value: new Date(),
    onChange: () => {},
    disabled: true,
    label: "Disabled date picker",
  },
};

export const WithDateRestrictions: Story = {
  args: {
    placeholder: "Pick a date",
    value: undefined,
    onChange: () => {},
    label: "Date with restrictions",
    minDate: new Date(),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
};
