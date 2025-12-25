import type { Meta, StoryObj } from "@storybook/react";
import { SelectSearch, type SelectSearchOption } from "./select-search";

const meta: Meta<typeof SelectSearch> = {
  title: "Components/SelectSearch",
  component: SelectSearch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SelectSearch>;

const options: SelectSearchOption[] = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
];

export const Default: Story = {
  args: {
    options,
    placeholder: "Select an option",
    value: null,
    onChange: () => {},
  },
};

export const WithLabel: Story = {
  args: {
    options,
    placeholder: "Select an option",
    value: null,
    onChange: () => {},
    label: "Choose an option",
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    options,
    placeholder: "Select an option",
    value: "1",
    onChange: () => {},
    disabled: true,
    label: "Disabled select",
  },
};

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: String(i),
      label: `Option ${i + 1}`,
    })),
    placeholder: "Search options...",
    value: null,
    onChange: () => {},
    label: "Searchable select with many options",
  },
};
