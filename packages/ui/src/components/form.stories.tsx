import type { Meta, StoryObj } from "@storybook/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { useForm } from "react-hook-form";

const meta = {
  title: "Components/Form",
  component: Form,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof Form>;

function FormExample() {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
  });

  return (
    <Form form={form} onSubmit={(data) => console.log(data)}>
      <FormField name="username">
        {({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter username" />
            </FormControl>
            <FormDescription>This is your public display name.</FormDescription>
          </FormItem>
        )}
      </FormField>
      <FormField name="email">
        {({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="Enter email" />
            </FormControl>
            <FormMessage error="Invalid email format" />
          </FormItem>
        )}
      </FormField>
    </Form>
  );
}

export const Default: Story = {
  render: () => <FormExample />,
};

export const WithError: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <FormField name="password">
        {({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input {...field} type="password" placeholder="Enter password" />
            </FormControl>
            <FormMessage error="Password must be at least 8 characters" />
          </FormItem>
        )}
      </FormField>
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <FormField name="bio">
        {({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Tell us about yourself" />
            </FormControl>
            <FormDescription>
              Max 200 characters. Keep it brief.
            </FormDescription>
          </FormItem>
        )}
      </FormField>
    </div>
  ),
};
