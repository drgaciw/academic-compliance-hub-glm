"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { Badge } from "@aah/ui";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RoleAssignmentProps {
  userId: string;
  userName: string;
  currentRole?: string;
  availableRoles: Role[];
  onRoleChange: (userId: string, roleId: string) => void;
}

export function RoleAssignment({
  userId,
  userName,
  currentRole,
  availableRoles,
  onRoleChange,
}: RoleAssignmentProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState(currentRole || "");

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    onRoleChange(userId, roleId);
  };

  const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">User</label>
        <p className="mt-1 text-sm text-muted-foreground">{userName}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Role</label>
        <div className="mt-2">
          <Select value={selectedRoleId} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex flex-col">
                    <span>{role.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedRole && (
        <div>
          <label className="text-sm font-medium">Permissions</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedRole.permissions.map((permission) => (
              <Badge key={permission} variant="outline">
                {permission}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
