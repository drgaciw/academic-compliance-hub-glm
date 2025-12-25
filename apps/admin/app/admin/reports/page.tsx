"use client";

import { useState } from "react";
import { LayoutDashboard, FileText, Filter, Menu, X } from "lucide-react";
import { ReportTemplateSelector } from "../../components/admin/report-template-selector";
import { FilterConfigurationUI } from "../../components/admin/filter-configuration-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Button } from "@aah/ui";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "Academic" | "Compliance" | "Athletic" | "Financial";
  fields: string[];
  lastUsed?: string;
}

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

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("templates");
  const [filters, setFilters] = useState<Filter[]>([]);

  const templates: ReportTemplate[] = [
    {
      id: "1",
      name: "Student Eligibility Report",
      description: "Overview of student eligibility status",
      category: "Academic",
      type: "Academic",
      fields: ["Student ID", "Name", "GPA", "Status", "Last Updated"],
      lastUsed: "2024-12-20",
    },
    {
      id: "2",
      name: "Transfer Credit Analysis",
      description: "Detailed transfer credit breakdown",
      category: "Academic",
      type: "Academic",
      fields: [
        "Student",
        "Transfer Institution",
        "Course",
        "Credits",
        "Equivalency",
      ],
      lastUsed: "2024-12-18",
    },
    {
      id: "3",
      name: "Compliance Audit Trail",
      description: "Track all compliance activities",
      category: "Compliance",
      type: "Compliance",
      fields: ["Date", "User", "Action", "Target", "Status", "Notes"],
    },
    {
      id: "4",
      name: "Athletic Progress Report",
      description: "Student athletic progress tracking",
      category: "Athletic",
      type: "Athletic",
      fields: ["Athlete", "Sport", "Season", "Progress", "Eligibility"],
    },
    {
      id: "5",
      name: "Financial Aid Summary",
      description: "Financial aid and scholarship details",
      category: "Financial",
      type: "Financial",
      fields: ["Student", "Award Type", "Amount", "Term", "Status"],
    },
  ];

  const availableFields: FilterOption[] = [
    { id: "student_id", name: "Student ID", type: "text" },
    { id: "name", name: "Name", type: "text" },
    { id: "gpa", name: "GPA", type: "number" },
    {
      id: "status",
      name: "Status",
      type: "select",
      options: [
        { id: "active", name: "Active" },
        { id: "pending", name: "Pending" },
        { id: "ineligible", name: "Ineligible" },
      ],
    },
    {
      id: "department",
      name: "Department",
      type: "select",
      options: [
        { id: "athletics", name: "Athletics" },
        { id: "compliance", name: "Compliance" },
        { id: "academic-affairs", name: "Academic Affairs" },
      ],
    },
    { id: "date_range", name: "Date Range", type: "date" },
  ];

  const availableOperators = [
    { id: "equals", name: "Equals" },
    { id: "not_equals", name: "Not Equals" },
    { id: "contains", name: "Contains" },
    { id: "greater_than", name: "Greater Than" },
    { id: "less_than", name: "Less Than" },
    { id: "between", name: "Between" },
  ];

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCreateTemplate = () => {
    console.log("Create new template");
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", filters);
  };

  const handleResetFilters = () => {
    setFilters([]);
  };

  const handleGenerateReport = () => {
    console.log("Generating report with template:", selectedTemplate);
    console.log("Using filters:", filters);
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: FileText },
    { href: "/admin/admin/reports", label: "Reports", icon: FileText },
  ];

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
              Reports
            </h2>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="filters" disabled={!selectedTemplate}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!selectedTemplate}>
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-6">
              <ReportTemplateSelector
                templates={templates}
                selectedTemplate={selectedTemplate || undefined}
                onSelectTemplate={handleSelectTemplate}
                onCreateTemplate={handleCreateTemplate}
              />
            </TabsContent>

            <TabsContent value="filters" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FilterConfigurationUI
                  availableFields={availableFields}
                  availableOperators={availableOperators}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Selected Template</CardTitle>
                    <CardDescription>
                      Review your selected report template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedTemplate ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">
                            {
                              templates.find((t) => t.id === selectedTemplate)
                                ?.name
                            }
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {
                              templates.find((t) => t.id === selectedTemplate)
                                ?.description
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Included Fields
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {templates
                              .find((t) => t.id === selectedTemplate)
                              ?.fields.map((field) => (
                                <span
                                  key={field}
                                  className="px-3 py-1 text-sm bg-muted rounded-md"
                                >
                                  {field}
                                </span>
                              ))}
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleGenerateReport}
                          disabled={selectedTemplate === null}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No template selected</p>
                        <p className="text-sm mt-1">
                          Select a template from the Templates tab
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>
                    Preview of the generated report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Template
                          </label>
                          <p className="font-medium">
                            {
                              templates.find((t) => t.id === selectedTemplate)
                                ?.name
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Type
                          </label>
                          <p className="font-medium">
                            {
                              templates.find((t) => t.id === selectedTemplate)
                                ?.type
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Fields
                          </label>
                          <p className="font-medium">
                            {
                              templates.find((t) => t.id === selectedTemplate)
                                ?.fields.length
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Filters
                          </label>
                          <p className="font-medium">{filters.length} active</p>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">Sample Output</h4>
                        <div className="text-sm text-muted-foreground">
                          Report generation ready. Configure filters and
                          generate the report.
                        </div>
                      </div>

                      <Button className="w-full" onClick={handleGenerateReport}>
                        Generate Final Report
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No template selected</p>
                      <p className="text-sm mt-1">
                        Select a template to preview report
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
