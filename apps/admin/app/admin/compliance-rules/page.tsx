"use client";

import { useState } from "react";
import { LayoutDashboard, FileText, Menu, X } from "lucide-react";
import { ComplianceRulesList } from "../../components/admin/compliance-rules-list";
import { RuleDetailEditor } from "../../components/admin/rule-detail-editor";
import { ConditionBuilder } from "../../components/admin/condition-builder";
import { RuleTestingSandbox } from "../../components/admin/rule-testing-sandbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aah/ui";

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "Active" | "Draft" | "Disabled";
  priority: "High" | "Medium" | "Low";
  lastUpdated: string;
  conditions?: any[];
}

export default function ComplianceRulesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("list");

  const availableCategories = [
    { id: "academic", name: "Academic" },
    { id: "athletic", name: "Athletic" },
    { id: "transfer", name: "Transfer Credit" },
  ];

  const availableFields = [
    { id: "gpa", name: "GPA", type: "number" },
    { id: "credits", name: "Credits Earned", type: "number" },
    { id: "semester", name: "Current Semester", type: "text" },
    { id: "status", name: "Status", type: "select" },
  ];

  const availableOperators = [
    { id: "equals", name: "Equals" },
    { id: "not_equals", name: "Not Equals" },
    { id: "greater_than", name: "Greater Than" },
    { id: "less_than", name: "Less Than" },
    { id: "contains", name: "Contains" },
  ];

  const rules: ComplianceRule[] = [
    {
      id: "1",
      name: "GPA Requirement",
      description: "Student must maintain minimum GPA",
      category: "Academic",
      status: "Active",
      priority: "High",
      lastUpdated: "2024-12-20",
      conditions: [
        {
          id: "1",
          field: "gpa",
          operator: "greater_than",
          value: "2.0",
        },
      ],
    },
    {
      id: "2",
      name: "Credit Completion",
      description: "Student must complete required credits",
      category: "Transfer",
      status: "Active",
      priority: "High",
      lastUpdated: "2024-12-18",
      conditions: [],
    },
    {
      id: "3",
      name: "Athletic Eligibility",
      description: "Check athletic participation requirements",
      category: "Athletic",
      status: "Draft",
      priority: "Medium",
      lastUpdated: "2024-12-15",
      conditions: [],
    },
  ];

  const handleCreateRule = () => {
    setEditingRule("new");
    setSelectedTab("editor");
  };

  const handleEditRule = (ruleId: string) => {
    setEditingRule(ruleId);
    setSelectedTab("editor");
  };

  const handleSaveRule = (data: any) => {
    console.log("Saving rule:", data);
    setEditingRule(null);
    setSelectedTab("list");
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setSelectedTab("list");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: FileText },
    {
      href: "/admin/admin/compliance-rules",
      label: "Compliance Rules",
      icon: FileText,
    },
  ];

  const currentRule =
    editingRule === "new" ? null : rules.find((r) => r.id === editingRule);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 lg:static lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between border-b px-6 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Hub
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4" aria-label="Sidebar navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Compliance Rules
            </h2>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="list">Rules List</TabsTrigger>
              <TabsTrigger value="editor" disabled={!editingRule}>
                Rule Editor
              </TabsTrigger>
              <TabsTrigger value="conditions" disabled={!editingRule}>
                Conditions
              </TabsTrigger>
              <TabsTrigger value="test" disabled={!editingRule}>
                Testing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <ComplianceRulesList
                rules={rules}
                onCreateRule={handleCreateRule}
                onEditRule={handleEditRule}
              />
            </TabsContent>

            <TabsContent value="editor" className="mt-6">
              <RuleDetailEditor
                ruleId={editingRule || undefined}
                initialData={currentRule}
                availableCategories={availableCategories}
                onSubmit={handleSaveRule}
                onCancel={handleCancelEdit}
              />
            </TabsContent>

            <TabsContent value="conditions" className="mt-6">
              <div className="max-w-4xl">
                <ConditionBuilder
                  availableFields={availableFields}
                  availableOperators={availableOperators}
                  valueInputType="number"
                  conditions={currentRule?.conditions || []}
                  onChange={(conditions) =>
                    console.log("Conditions changed:", conditions)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="test" className="mt-6">
              <div className="max-w-4xl">
                <RuleTestingSandbox
                  ruleName={currentRule?.name || ""}
                  conditions={currentRule?.conditions || []}
                  onRunTest={(testData) =>
                    console.log("Running test:", testData)
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
