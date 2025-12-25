"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@aah/ui";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@aah/ui";
import { Checkbox } from "@aah/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@aah/ui";
import { Input } from "@aah/ui";

export interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnSelectorProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  trigger?: React.ReactNode;
}

export function ColumnSelector({
  columns,
  onColumnsChange,
  trigger,
}: ColumnSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleColumn = (columnId: string) => {
    const updated = columns.map((col) =>
      col.id === columnId ? { ...col, visible: !col.visible } : col,
    );
    onColumnsChange(updated);
  };

  const handleToggleAll = (visible: boolean) => {
    const updated = columns.map((col) => ({ ...col, visible }));
    onColumnsChange(updated);
  };

  const visibleCount = columns.filter((col) => col.visible).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Columns ({visibleCount})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Columns</DialogTitle>
          <DialogDescription>
            Choose which columns to display in the table
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleAll(true)}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleAll(false)}
            >
              Clear All
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredColumns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No columns found
              </p>
            ) : (
              filteredColumns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handleToggleColumn(column.id)}
                >
                  <Checkbox
                    id={column.id}
                    checked={column.visible}
                    onCheckedChange={() => handleToggleColumn(column.id)}
                  />
                  <label
                    htmlFor={column.id}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ColumnSelectorDropdown({
  columns,
  onColumnsChange,
}: ColumnSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleColumn = (columnId: string) => {
    const updated = columns.map((col) =>
      col.id === columnId ? { ...col, visible: !col.visible } : col,
    );
    onColumnsChange(updated);
  };

  const visibleCount = columns.filter((col) => col.visible).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Columns ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="p-2">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.visible}
              onCheckedChange={() => handleToggleColumn(column.id)}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
