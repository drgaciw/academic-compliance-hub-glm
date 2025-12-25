"use client";

import * as React from "react";
import { Button } from "@aah/ui";
import { Input } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { Badge } from "@aah/ui";
import { Plus, X, ChevronRight } from "lucide-react";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ConditionGroup {
  id: string;
  type: "AND" | "OR";
  conditions: (Condition | ConditionGroup)[];
}

interface ConditionBuilderProps {
  availableFields: { id: string; name: string; type: string }[];
  availableOperators: { id: string; name: string }[];
  valueInputType?: "text" | "number" | "select" | "date";
  valueOptions?: { id: string; name: string }[];
  conditions: (Condition | ConditionGroup)[];
  onChange: (conditions: (Condition | ConditionGroup)[]) => void;
}

export function ConditionBuilder({
  availableFields,
  availableOperators,
  valueInputType = "text",
  valueOptions,
  conditions,
  onChange,
}: ConditionBuilderProps) {
  const generateId = () => crypto.randomUUID();

  const addCondition = (groupId: string) => {
    const updateConditions = (
      items: (Condition | ConditionGroup)[],
    ): (Condition | ConditionGroup)[] => {
      return items.map((item) => {
        if (!("conditions" in item)) {
          return item;
        }

        const group = item as ConditionGroup;
        if (group.id === groupId) {
          return {
            ...group,
            conditions: [
              ...group.conditions,
              {
                id: generateId(),
                field: availableFields[0]?.id || "",
                operator: availableOperators[0]?.id || "",
                value: "",
              },
            ],
          };
        }

        return {
          ...group,
          conditions: updateConditions(group.conditions),
        };
      });
    };

    onChange(updateConditions(conditions));
  };

  const addGroup = (parentId: string) => {
    const updateConditions = (
      items: (Condition | ConditionGroup)[],
    ): (Condition | ConditionGroup)[] => {
      return items.map((item) => {
        if (!("conditions" in item)) {
          return item;
        }

        const group = item as ConditionGroup;
        if (group.id === parentId) {
          return {
            ...group,
            conditions: [
              ...group.conditions,
              {
                id: generateId(),
                type: "AND",
                conditions: [],
              },
            ],
          };
        }

        return {
          ...group,
          conditions: updateConditions(group.conditions),
        };
      });
    };

    onChange(updateConditions(conditions));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    const updateConditions = (
      items: (Condition | ConditionGroup)[],
    ): (Condition | ConditionGroup)[] => {
      return items
        .map((item) => {
          if (!("conditions" in item)) {
            return item;
          }

          const group = item as ConditionGroup;
          if (group.id === groupId) {
            return {
              ...group,
              conditions: group.conditions.filter((c) => c.id !== conditionId),
            };
          }

          return {
            ...group,
            conditions: updateConditions(group.conditions),
          };
        })
        .filter(
          (item) =>
            !("conditions" in item) ||
            (item as ConditionGroup).conditions.length > 0,
        );
    };

    onChange(updateConditions(conditions));
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<Condition>,
  ) => {
    const updateConditions = (
      items: (Condition | ConditionGroup)[],
    ): (Condition | ConditionGroup)[] => {
      return items.map((item) => {
        if ("field" in item) {
          const condition = item as Condition;
          if (condition.id === conditionId && groupId === "root") {
            return { ...condition, ...updates };
          }
          return condition;
        }

        const group = item as ConditionGroup;
        return {
          ...group,
          conditions: updateConditions(group.conditions),
        };
      });
    };

    onChange(updateConditions(conditions));
  };

  const toggleGroupType = (groupId: string) => {
    const updateConditions = (
      items: (Condition | ConditionGroup)[],
    ): (Condition | ConditionGroup)[] => {
      return items.map((item) => {
        if (!("conditions" in item)) {
          return item;
        }

        const group = item as ConditionGroup;
        if (group.id === groupId) {
          return {
            ...group,
            type: group.type === "AND" ? "OR" : "AND",
          };
        }

        return {
          ...group,
          conditions: updateConditions(group.conditions),
        };
      });
    };

    onChange(updateConditions(conditions));
  };

  const renderCondition = (
    item: Condition | ConditionGroup,
    groupId: string,
    depth: number = 0,
  ) => {
    const isCondition = "field" in item;
    const cond = isCondition ? (item as Condition) : (item as ConditionGroup);
    const id = cond.id;

    if (!isCondition) {
      const group = cond as ConditionGroup;
      return (
        <div key={id} className="space-y-2 ml-4 pl-4 border-l-2 border-muted">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleGroupType(id)}
              className="h-6 px-2 text-xs font-medium"
            >
              {group.type}
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addCondition(id)}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
              Condition
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addGroup(id)}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
              Group
            </Button>
          </div>

          {group.conditions.map((c: Condition | ConditionGroup) =>
            renderCondition(c, id, depth + 1),
          )}
        </div>
      );
    }

    const condition = cond as Condition;
    return (
      <div key={id} className="flex items-center gap-2 mb-2">
        <Select
          value={condition.field}
          onValueChange={(value) =>
            updateCondition(groupId, id, { field: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {availableFields.map((field) => (
              <SelectItem key={field.id} value={field.id}>
                <div className="flex flex-col">
                  <span>{field.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {field.type}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.operator}
          onValueChange={(value) =>
            updateCondition(groupId, id, { operator: value })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {availableOperators.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {valueInputType === "select" && valueOptions ? (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(groupId, id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {valueOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={valueInputType}
            value={condition.value}
            onChange={(e) =>
              updateCondition(groupId, id, { value: e.target.value })
            }
            placeholder="Value"
            className="flex-1"
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCondition(groupId, id)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Conditions</h4>
        <Badge variant="outline">{conditions.length} condition(s)</Badge>
      </div>

      <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
        {conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No conditions added</p>
            <Button
              variant="outline"
              onClick={() => addCondition("root")}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>
        ) : (
          <>
            {conditions.map((item) => renderCondition(item, "root"))}
            <Button
              variant="outline"
              onClick={() => addCondition("root")}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
