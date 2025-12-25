"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@aah/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aah/ui";
import { Badge } from "@aah/ui";
import { Progress } from "@aah/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@aah/ui";
import { RadioGroup, RadioGroupItem } from "@aah/ui";
import { Label } from "@aah/ui";

export type BulkAction =
  | "approve"
  | "reject"
  | "pending"
  | "review_required"
  | "archive"
  | "delete";

interface BulkActionOption {
  id: BulkAction;
  label: string;
  icon: React.ElementType;
  description: string;
  variant: "default" | "destructive" | "secondary";
}

const bulkActions: BulkActionOption[] = [
  {
    id: "approve",
    label: "Approve All",
    icon: CheckCircle,
    description: "Mark all selected as approved",
    variant: "default",
  },
  {
    id: "reject",
    label: "Reject All",
    icon: XCircle,
    description: "Mark all selected as rejected",
    variant: "destructive",
  },
  {
    id: "pending",
    label: "Set to Pending",
    icon: Clock,
    description: "Reset all selected to pending status",
    variant: "secondary",
  },
  {
    id: "review_required",
    label: "Request Review",
    icon: AlertTriangle,
    description: "Flag all selected for review",
    variant: "secondary",
  },
  {
    id: "archive",
    label: "Archive All",
    icon: Clock,
    description: "Archive all selected records",
    variant: "secondary",
  },
  {
    id: "delete",
    label: "Delete All",
    icon: XCircle,
    description: "Permanently delete all selected records",
    variant: "destructive",
  },
];

interface BulkActionDropdownProps {
  selectedCount: number;
  onAction: (action: BulkAction, selectedIds: string[]) => Promise<void>;
  disabled?: boolean;
  selectedIds?: string[];
}

export function BulkActionDropdown({
  selectedCount,
  onAction,
  disabled = false,
  selectedIds = [],
}: BulkActionDropdownProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [addNote, setAddNote] = useState(false);
  const [note, setNote] = useState("");

  const handleAction = async (action: BulkAction) => {
    const actionOption = bulkActions.find((a) => a.id === action);
    if (actionOption?.variant === "destructive") {
      setSelectedAction(action);
      setDialogOpen(true);
    } else {
      await executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction) => {
    setLoading(true);
    try {
      await onAction(action, selectedIds);
      setDialogOpen(false);
      setNote("");
      setAddNote(false);
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const actionOption = bulkActions.find((a) => a.id === selectedAction);
  const ActionIcon = actionOption?.icon;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || selectedCount === 0}
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions ({selectedCount})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {bulkActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={selectedCount === 0}
              >
                <Icon className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span
                    className={
                      action.variant === "destructive" ? "text-destructive" : ""
                    }
                  >
                    {action.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {ActionIcon && <ActionIcon className="h-5 w-5" />}
              Confirm {actionOption?.label}
            </DialogTitle>
            <DialogDescription>{actionOption?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                You are about to{" "}
                <strong>{actionOption?.label.toLowerCase()}</strong>{" "}
                <strong>{selectedCount}</strong> record(s). This action{" "}
                {actionOption?.variant === "destructive" ? (
                  <span className="text-destructive font-semibold">
                    cannot be undone
                  </span>
                ) : (
                  "can be reversed"
                )}
                .
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addNote"
                  checked={addNote}
                  onChange={(e) => setAddNote(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="addNote" className="cursor-pointer">
                  Add a note to all records
                </Label>
              </div>

              {addNote && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter your note..."
                  className="w-full h-24 px-3 py-2 border rounded-md text-sm resize-none"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedAction && executeAction(selectedAction)}
                disabled={loading}
                variant={
                  actionOption?.variant === "destructive"
                    ? "destructive"
                    : "default"
                }
                className="flex-1"
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface BatchStatusUpdateProps {
  selectedIds: string[];
  total: number;
  onComplete?: (updated: number) => void;
  onCancel?: () => void;
}

export function BatchStatusUpdate({
  selectedIds,
  total,
  onComplete,
  onCancel,
}: BatchStatusUpdateProps) {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState<
    "pending" | "processing" | "complete" | "error"
  >("pending");
  const [error, setError] = useState<string | null>(null);

  const startUpdate = async () => {
    setStatus("processing");
    setError(null);

    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setCurrent(i + 1);
      setProgress(((i + 1) / total) * 100);
    }

    setStatus("complete");
    onComplete?.(total);
  };

  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "processing":
        return <Clock className="h-5 w-5 animate-spin" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">
            {status === "complete"
              ? "Update Complete"
              : status === "error"
                ? "Update Failed"
                : "Updating Records"}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {current} of {total}
        </span>
      </div>

      <Progress value={progress} className="w-full" />

      {status === "processing" && (
        <p className="text-sm text-muted-foreground text-center">
          Processing {selectedIds[current]?.slice(0, 8)}...
        </p>
      )}

      {status === "complete" && (
        <div className="text-center space-y-2">
          <p className="text-sm text-green-600">
            Successfully updated {total} record(s)
          </p>
          <Button onClick={onCancel} variant="outline" size="sm">
            Close
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">
            {error || "An error occurred"}
          </p>
          <Button onClick={startUpdate} variant="outline" size="sm">
            Retry
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Close
          </Button>
        </div>
      )}

      {status === "pending" && (
        <div className="flex justify-center">
          <Button onClick={startUpdate}>Start Update</Button>
        </div>
      )}
    </div>
  );
}
