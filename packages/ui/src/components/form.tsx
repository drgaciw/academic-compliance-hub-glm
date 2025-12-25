import * as React from "react";
import {
  FormProvider,
  useFormContext,
  type FieldValues,
  type FormState,
  type UseFormReturn,
  type Path,
} from "react-hook-form";

import { cn } from "../lib/utils";

interface FormProps<T extends FieldValues> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  className?: string;
  onSubmit?: (data: T, event?: React.BaseSyntheticEvent) => void;
}

function Form<T extends FieldValues>({
  children,
  form,
  className,
  onSubmit,
}: FormProps<T>) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault?.();
    if (onSubmit) {
      form.handleSubmit(onSubmit)(event);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  children: (field: {
    field: {
      value: any;
      onChange: (value: any) => void;
      onBlur: () => void;
      name: string;
    };
    formState: FormState<TFieldValues>;
  }) => React.ReactNode;
}

function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  children,
}: FormFieldProps<TFieldValues>) {
  const methods = useFormContext<TFieldValues>();
  const formState = methods.formState;

  const field = {
    value: methods.watch(name),
    onChange: (value: any) => {
      methods.setValue(name, value);
    },
    onBlur: () => methods.trigger(name),
    name: name as string,
  };

  return (
    <FormFieldContext.Provider value={{ name: name as string }}>
      {children({ field, formState })}
    </FormFieldContext.Provider>
  );
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormItem({ className, ...props }: FormItemProps) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

interface FormLabelProps extends React.HTMLAttributes<HTMLLabelElement> {}

function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormControl({ ...props }: FormControlProps) {
  return <div {...props} />;
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
}

function FormMessage({ className, error, ...props }: FormMessageProps) {
  const context = React.useContext(FormFieldContext);
  const methods = useFormContext();

  const message =
    error ||
    (context.name
      ? (methods.formState.errors as any)[context.name]?.message
      : undefined);

  if (!message) {
    return null;
  }

  return (
    <p
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {String(message)}
    </p>
  );
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  type FormProps,
  type FormFieldProps,
};
