"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@aah/ui";
import { Button } from "@aah/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@aah/ui";
import { DatePicker } from "@aah/ui";

export interface DateRange {
  from: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (date: DateRange | undefined) => void;
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

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  id,
  label,
  required,
  minDate,
  maxDate,
  dateFormat = "MMM d, yyyy",
  ariaLabel,
}: DateRangePickerProps) {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = React.useState<Date | undefined>(value?.to);

  React.useEffect(() => {
    setFromDate(value?.from);
    setToDate(value?.to);
  }, [value]);

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    if (date) {
      onChange({ from: date, to: toDate });
    } else {
      onChange(undefined);
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    if (fromDate) {
      onChange({ from: fromDate, to: date });
    }
  };

  const displayDate = React.useMemo(() => {
    if (!value?.from) return "";
    if (value?.to) {
      return `${format(value.from, dateFormat)} - ${format(value.to, dateFormat)}`;
    }
    return format(value.from, dateFormat);
  }, [value, dateFormat]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <DatePicker
          value={fromDate}
          onChange={handleFromDateChange}
          placeholder="From"
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate || (toDate && new Date(toDate.getTime() - 86400000))}
          className="flex-1"
        />
        <DatePicker
          value={toDate}
          onChange={handleToDateChange}
          placeholder="To"
          disabled={disabled || !fromDate}
          minDate={fromDate}
          maxDate={maxDate}
          className="flex-1"
        />
      </div>
    </div>
  );
}
