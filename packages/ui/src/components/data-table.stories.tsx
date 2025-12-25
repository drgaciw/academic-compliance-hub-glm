import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Person = {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
};

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable<Person, unknown>>;

export default meta;
type Story = StoryObj<typeof DataTable<Person, unknown>>;

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: (info) => info.getValue() as number,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: (info) => info.getValue() as string,
  },
];

const data: Person[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 28,
    role: "Developer",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    age: 34,
    role: "Designer",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol@example.com",
    age: 42,
    role: "Manager",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    age: 31,
    role: "Developer",
  },
  {
    id: "5",
    name: "Eve Davis",
    email: "eve@example.com",
    age: 27,
    role: "Designer",
  },
];

export const Default: Story = {
  args: {
    columns,
    data,
    className: "max-w-4xl mx-auto p-8",
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    className: "max-w-4xl mx-auto p-8",
  },
};

export const LargeDataset: Story = {
  args: {
    columns,
    data: Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      age: 20 + (i % 50),
      role: (["Developer", "Designer", "Manager", "Tester"] as const)[
        i % 4
      ] as string,
    })),
    className: "max-w-4xl mx-auto p-8",
  },
};
