"use client";

import * as React from "react";
import { DataTable } from "@aah/ui";
import { Button } from "@aah/ui";
import { Badge } from "@aah/ui";
import { Plus, FileText } from "lucide-react";

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "Active" | "Draft" | "Disabled";
  priority: "High" | "Medium" | "Low";
  lastUpdated: string;
}

interface ComplianceRulesListProps {
  rules: ComplianceRule[];
  onCreateRule: () => void;
  onEditRule: (ruleId: string) => void;
}

export function ComplianceRulesList({
  rules,
  onCreateRule,
  onEditRule,
}: ComplianceRulesListProps) {
  const columns = [
    {
      accessorKey: "name",
      header: "Rule Name",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{info.getValue() as string}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info: any) => (
        <span className="text-sm text-muted-foreground truncate max-w-xs">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info: any) => (
        <Badge variant="outline">{info.getValue() as string}</Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (info: any) => {
        const priority = info.getValue() as ComplianceRule["priority"];
        const variant =
          priority === "High"
            ? "default"
            : priority === "Medium"
              ? "secondary"
              : "outline";
        return <Badge variant={variant}>{priority}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => {
        const status = info.getValue() as ComplianceRule["status"];
        const variant =
          status === "Active"
            ? "default"
            : status === "Draft"
              ? "secondary"
              : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditRule(info.row.original.id)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Rules</h3>
          <p className="text-sm text-muted-foreground">
            {rules.length} rules configured
          </p>
        </div>
        <Button onClick={onCreateRule}>
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rules}
        pageSize={10}
        filterPlaceholder="Search rules..."
      />
    </div>
  );
}
