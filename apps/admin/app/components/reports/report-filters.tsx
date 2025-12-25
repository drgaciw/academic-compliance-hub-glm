"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@aah/ui";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@aah/ui";
import { Input } from "@aah/ui";
import { Badge } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { Label } from "@aah/ui";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface ReportFiltersProps {
  onFiltersChange?: (filters: Record<string, string[]>) => void;
  availableFilters?: {
    actionType?: FilterOption[];
    status?: FilterOption[];
    user?: FilterOption[];
    dateRange?: FilterOption[];
  };
}

export function ReportFilters({
  onFiltersChange,
  availableFilters,
}: ReportFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );

  const defaultFilters = {
    actionType: [
      { id: "create", label: "Created" },
      { id: "update", label: "Updated" },
      { id: "delete", label: "Deleted" },
      { id: "approve", label: "Approved" },
      { id: "reject", label: "Rejected" },
      { id: "export", label: "Exported" },
      { id: "import", label: "Imported" },
    ],
    status: [
      { id: "approved", label: "Approved" },
      { id: "pending", label: "Pending" },
      { id: "rejected", label: "Rejected" },
      { id: "review_required", label: "Review Required" },
    ],
    dateRange: [
      { id: "today", label: "Today" },
      { id: "week", label: "This Week" },
      { id: "month", label: "This Month" },
      { id: "quarter", label: "This Quarter" },
      { id: "year", label: "This Year" },
      { id: "all", label: "All Time" },
    ],
  };

  const filters = {
    actionType: availableFilters?.actionType || defaultFilters.actionType,
    status: availableFilters?.status || defaultFilters.status,
    dateRange: availableFilters?.dateRange || defaultFilters.dateRange,
    user: availableFilters?.user || [],
  };

  const handleToggleFilter = (filterKey: string, optionId: string) => {
    const current = activeFilters[filterKey] || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];

    const newActiveFilters = { ...activeFilters, [filterKey]: updated };
    setActiveFilters(newActiveFilters);
    onFiltersChange?.(newActiveFilters);
  };

  const handleClearFilter = (filterKey: string) => {
    const newActiveFilters = { ...activeFilters, [filterKey]: [] };
    setActiveFilters(newActiveFilters);
    onFiltersChange?.(newActiveFilters);
  };

  const handleClearAll = () => {
    setActiveFilters({});
    onFiltersChange?.({});
  };

  const getActiveCount = () => {
    return Object.values(activeFilters).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
  };

  const FilterDropdown = ({
    filterKey,
    label,
  }: {
    filterKey: string;
    label: string;
  }) => {
    const options = filters[filterKey as keyof typeof filters];
    if (!options || options.length === 0) return null;

    const isOpen = openDropdowns[filterKey] || false;
    const selected = activeFilters[filterKey] || [];

    return (
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open) =>
          setOpenDropdowns({ ...openDropdowns, [filterKey]: open })
        }
      >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {label}
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selected.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={selected.includes(option.id)}
              onCheckedChange={() => handleToggleFilter(filterKey, option.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {option.count && (
                  <span className="text-xs text-muted-foreground">
                    ({option.count})
                  </span>
                )}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
          {selected.length > 0 && (
            <>
              <div className="border-t my-1" />
              <button
                onClick={() => handleClearFilter(filterKey)}
                className="w-full text-left px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded"
              >
                Clear {label}
              </button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown filterKey="actionType" label="Action Type" />
          <FilterDropdown filterKey="status" label="Status" />
          <FilterDropdown filterKey="dateRange" label="Date Range" />

          {availableFilters?.user && availableFilters.user.length > 0 && (
            <FilterDropdown filterKey="user" label="User" />
          )}
        </div>

        {getActiveCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <X className="h-4 w-4 mr-2" />
            Clear All ({getActiveCount()})
          </Button>
        )}
      </div>

      {getActiveCount() > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(activeFilters).map(([filterKey, selected]) =>
            selected.map((optionId) => {
              const option = filters[filterKey as keyof typeof filters]?.find(
                (opt) => opt.id === optionId,
              );
              if (!option) return null;

              return (
                <Badge
                  key={`${filterKey}-${optionId}`}
                  variant="secondary"
                  className="gap-1"
                >
                  {option.label}
                  <button
                    onClick={() => handleToggleFilter(filterKey, optionId)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}

interface UserFilterProps {
  users: Array<{ id: string; name: string; email: string }>;
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
  placeholder?: string;
}

export function UserFilter({
  users,
  selectedUsers,
  onSelectionChange,
  placeholder = "Filter by user...",
}: UserFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  };

  const selectedUserObjects = users.filter((u) => selectedUsers.includes(u.id));

  return (
    <div className="relative w-full md:w-80">
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="border-0 focus-visible:ring-0 px-0"
        />
        {selectedUsers.length > 0 && (
          <Badge variant="secondary">{selectedUsers.length}</Badge>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No users found
            </div>
          ) : (
            <div className="p-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => toggleUser(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedUserObjects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedUserObjects.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1">
              {user.name}
              <button
                onClick={() => toggleUser(user.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActionTypeFilterProps {
  selectedActions: string[];
  onSelectionChange: (actions: string[]) => void;
  availableActions?: FilterOption[];
}

export function ActionTypeFilter({
  selectedActions,
  onSelectionChange,
  availableActions,
}: ActionTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions = [
    { id: "create", label: "Created" },
    { id: "update", label: "Updated" },
    { id: "delete", label: "Deleted" },
    { id: "approve", label: "Approved" },
    { id: "reject", label: "Rejected" },
    { id: "export", label: "Exported" },
    { id: "import", label: "Imported" },
    { id: "login", label: "Login" },
    { id: "logout", label: "Logout" },
  ];

  const actions = availableActions || defaultActions;

  const toggleAction = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      onSelectionChange(selectedActions.filter((id) => id !== actionId));
    } else {
      onSelectionChange([...selectedActions, actionId]);
    }
  };

  const getActionColor = (actionId: string) => {
    switch (actionId) {
      case "create":
      case "approve":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case "update":
      case "export":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "delete":
      case "reject":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  const selectedActionObjects = actions.filter((a) =>
    selectedActions.includes(a.id),
  );

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Action Type
            {selectedActions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedActions.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-1">
            {actions.map((action) => (
              <DropdownMenuCheckboxItem
                key={action.id}
                checked={selectedActions.includes(action.id)}
                onCheckedChange={() => toggleAction(action.id)}
              >
                {action.label}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
          {selectedActions.length > 0 && (
            <>
              <div className="border-t my-1" />
              <button
                onClick={() => onSelectionChange([])}
                className="w-full text-left px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded"
              >
                Clear All
              </button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedActionObjects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedActionObjects.map((action) => (
            <Badge
              key={action.id}
              variant="secondary"
              className={`gap-1 ${getActionColor(action.id)}`}
            >
              {action.label}
              <button
                onClick={() => toggleAction(action.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
