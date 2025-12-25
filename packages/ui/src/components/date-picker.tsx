"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  ariaLabel?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  label,
  required,
  minDate,
  maxDate,
  dateFormat = "PPP",
  ariaLabel,
}: DatePickerProps) {
  const triggerId = id || `date-picker-${React.useId()}`;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={triggerId} className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              "h-10 px-3",
              "border-input bg-background",
              "hover:bg-accent hover:text-accent-foreground",
              !value && "text-muted-foreground",
            )}
            disabled={disabled}
            aria-label={ariaLabel || label}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value ? format(value, dateFormat) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={
              disabled ||
              ((date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              })
            }
            initialFocus
            className={cn(
              "p-3",
              "[&_caption]:flex [&_caption]:items-center [&_caption]:justify-between",
              "[&_caption]:text-sm [&_caption]:font-medium",
              "[&_button]:w-9 [&_button]:h-9 [&_button]:p-0",
              "[&_button]:text-sm [&_button]:rounded-md",
              "[&_button]:focus-visible:outline-none",
              "[&_button]:focus-visible:ring-2",
              "[&_button]:focus-visible:ring-ring",
              "[&_[aria-selected]]:bg-primary [&_[aria-selected]]:text-primary-foreground",
            )}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
