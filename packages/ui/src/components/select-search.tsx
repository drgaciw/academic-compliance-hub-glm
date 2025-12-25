"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "./input";
import { Button } from "./button";

export interface SelectSearchOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectSearchProps<T = string> {
  options: SelectSearchOption<T>[];
  value?: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
  ariaLabel?: string;
}

export function SelectSearch<T = string>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  searchable = true,
  className,
  id,
  label,
  required,
  ariaLabel,
}: SelectSearchProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    const searchLower = searchTerm.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchLower),
    );
  }, [options, searchTerm]);

  React.useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setHighlightedIndex(-1);
  }, [isOpen, searchable]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const max = filteredOptions.length - 1;
          return prev < max ? prev + 1 : prev;
        });
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const triggerId = id || `select-search-${React.useId()}`;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={triggerId} className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Button
          ref={triggerRef}
          id={triggerId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label}
          className={cn(
            "w-full justify-between font-normal h-10 px-3",
            "border-input bg-background",
            "hover:bg-accent hover:text-accent-foreground",
          )}
          variant="outline"
          onKeyDown={handleKeyDown}
        >
          <span className="flex-1 text-left truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 p-0.5 hover:bg-accent rounded-sm"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </Button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md",
              "max-h-60 overflow-auto",
            )}
            role="listbox"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `${triggerId}-option-${highlightedIndex}`
                : undefined
            }
          >
            {searchable && (
              <div className="sticky top-0 bg-popover p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8"
                    aria-label="Search options"
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground px-3">
                No options found
              </div>
            ) : (
              <ul role="listbox">
                {filteredOptions.map((option, index) => (
                  <li
                    key={`${option.value}`}
                    id={`${triggerId}-option-${index}`}
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      highlightedIndex === index && "bg-accent",
                      option.value === value && "bg-accent font-medium",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ✓
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
