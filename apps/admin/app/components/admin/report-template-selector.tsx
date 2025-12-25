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
import { FileText, ChevronRight, Check } from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "Academic" | "Compliance" | "Athletic" | "Financial";
  fields: string[];
  lastUsed?: string;
}

interface ReportTemplateSelectorProps {
  templates: ReportTemplate[];
  selectedTemplate?: string;
  onSelectTemplate: (templateId: string) => void;
  onCreateTemplate?: () => void;
}

export function ReportTemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onCreateTemplate,
}: ReportTemplateSelectorProps) {
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const getTypeColor = (type: ReportTemplate["type"]) => {
    const colors = {
      Academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Compliance:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Athletic:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Financial:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[type];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>
              Select a template to generate your report
            </CardDescription>
          </div>
          {onCreateTemplate && (
            <Button variant="outline" onClick={onCreateTemplate}>
              <FileText className="mr-2 h-4 w-4" />
              New Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {category}
              </h4>
              <div className="space-y-2">
                {templates
                  .filter((t) => t.category === category)
                  .map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {template.name}
                              </span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge className={getTypeColor(template.type)}>
                                {template.type}
                              </Badge>
                              <Badge variant="outline">
                                {template.fields.length} fields
                              </Badge>
                              {template.lastUsed && (
                                <span className="text-xs text-muted-foreground">
                                  Last used: {template.lastUsed}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates available</p>
              {onCreateTemplate && (
                <Button
                  variant="outline"
                  onClick={onCreateTemplate}
                  className="mt-4"
                >
                  Create Your First Template
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
