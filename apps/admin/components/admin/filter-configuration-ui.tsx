"use client";

import * as React from "react";
import { Button } from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Badge } from "@aah/ui";
import { Input } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { Plus, X, ChevronDown, ChevronUp, Filter } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select";
  options?: { id: string; name: string }[];
}

interface Filter {
  id: string;
  fieldId: string;
  operator: string;
  value: string | string[];
}

interface FilterConfigurationUIProps {
  availableFields: FilterOption[];
  availableOperators: { id: string; name: string }[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export function FilterConfigurationUI({
  availableFields,
  availableOperators,
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: FilterConfigurationUIProps) {
  const [expandedFilters, setExpandedFilters] = React.useState<Set<string>>(
    new Set(),
  );

  const generateId = () => crypto.randomUUID();

  const addFilter = () => {
    const newFilter: Filter = {
      id: generateId(),
      fieldId: availableFields[0]?.id || "",
      operator: availableOperators[0]?.id || "",
      value: "",
    };
    onFiltersChange([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    onFiltersChange(filters.filter((f) => f.id !== filterId));
  };

  const updateFilter = (filterId: string, updates: Partial<Filter>) => {
    onFiltersChange(
      filters.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
    );
  };

  const toggleExpanded = (filterId: string) => {
    setExpandedFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filterId)) {
        newSet.delete(filterId);
      } else {
        newSet.add(filterId);
      }
      return newSet;
    });
  };

  const getField = (fieldId: string) => {
    return availableFields.find((f) => f.id === fieldId);
  };

  const activeFiltersCount = filters.filter((f) => {
    const isEmpty = Array.isArray(f.value)
      ? f.value.length === 0
      : f.value === "";
    return !isEmpty;
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Configuration
            </CardTitle>
            <CardDescription>
              Configure filters to refine your report data
            </CardDescription>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="default">{activeFiltersCount} active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {filters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No filters configured</p>
              <Button variant="outline" onClick={addFilter} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
            </div>
          ) : (
            <>
              {filters.map((filter) => {
                const field = getField(filter.fieldId);
                const isExpanded = expandedFilters.has(filter.id);
                const isEmpty = Array.isArray(filter.value)
                  ? filter.value.length === 0
                  : filter.value === "";
                const isActive = !isEmpty;

                return (
                  <div
                    key={filter.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(filter.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="font-medium">{field?.name}</span>
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">
                              Field
                            </label>
                            <Select
                              value={filter.fieldId}
                              onValueChange={(value) =>
                                updateFilter(filter.id, { fieldId: value })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFields.map((f) => (
                                  <SelectItem key={f.id} value={f.id}>
                                    {f.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground">
                              Operator
                            </label>
                            <Select
                              value={filter.operator}
                              onValueChange={(value) =>
                                updateFilter(filter.id, { operator: value })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOperators.map((op) => (
                                  <SelectItem key={op.id} value={op.id}>
                                    {op.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-muted-foreground">
                            Value
                          </label>
                          {field?.type === "select" && field.options ? (
                            <Select
                              value={
                                Array.isArray(filter.value)
                                  ? filter.value[0]
                                  : filter.value
                              }
                              onValueChange={(value) =>
                                updateFilter(filter.id, { value })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={
                                field?.type === "number"
                                  ? "number"
                                  : field?.type === "date"
                                    ? "date"
                                    : "text"
                              }
                              value={
                                Array.isArray(filter.value)
                                  ? filter.value[0]
                                  : filter.value
                              }
                              onChange={(e) =>
                                updateFilter(filter.id, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="Enter value"
                              className="mt-1"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Button variant="outline" onClick={addFilter} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
            </>
          )}
        </div>

        {(onApply || onReset) && (
          <div className="flex gap-2 pt-4 border-t">
            {onReset && (
              <Button variant="outline" onClick={onReset} className="flex-1">
                Reset
              </Button>
            )}
            {onApply && (
              <Button onClick={onApply} className="flex-1">
                Apply Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
