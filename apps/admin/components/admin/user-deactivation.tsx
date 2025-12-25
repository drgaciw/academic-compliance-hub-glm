"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@aah/ui";
import { Button } from "@aah/ui";
import { AlertCircle } from "lucide-react";

interface UserDeactivationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userEmail: string;
}

export function UserDeactivation({
  open,
  onClose,
  onConfirm,
  userName,
  userEmail,
}: UserDeactivationProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Deactivate User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this user? This action can be
            reversed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• User will no longer be able to sign in</p>
            <p>• All user data will be preserved</p>
            <p>• Account can be reactivated at any time</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Deactivate User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
