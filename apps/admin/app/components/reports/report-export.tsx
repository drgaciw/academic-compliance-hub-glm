"use client";

import { useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FileText as FilePdf,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@aah/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@aah/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@aah/ui";
import { RadioGroup, RadioGroupItem } from "@aah/ui";
import { Label } from "@aah/ui";
import { Checkbox } from "@aah/ui";

export type ExportFormat = "pdf" | "csv" | "excel";

interface ExportOption {
  id: ExportFormat;
  label: string;
  icon: React.ElementType;
  description: string;
}

const exportOptions: ExportOption[] = [
  {
    id: "pdf",
    label: "PDF",
    icon: FilePdf,
    description: "Portable Document Format - Best for printing",
  },
  {
    id: "csv",
    label: "CSV",
    icon: FileSpreadsheet,
    description: "Comma Separated Values - Compatible with Excel",
  },
  {
    id: "excel",
    label: "Excel",
    icon: FileDown,
    description: "Microsoft Excel - Full formatting support",
  },
];

interface ReportExportProps {
  data: any[];
  filename?: string;
  trigger?: React.ReactNode;
  onExport?: (format: ExportFormat, options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  includeHeaders: boolean;
  includeMetadata: boolean;
  formatDate: boolean;
}

export function ReportExport({
  data,
  filename = "report",
  trigger,
  onExport,
}: ReportExportProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeHeaders: true,
    includeMetadata: false,
    formatDate: true,
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      if (onExport) {
        await onExport(format, options);
      } else {
        await defaultExport(format, data, filename, options);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultExport = async (
    format: ExportFormat,
    data: any[],
    filename: string,
    options: ExportOptions,
  ) => {
    switch (format) {
      case "csv":
        exportToCSV(data, filename, options);
        break;
      case "excel":
        exportToExcel(data, filename, options);
        break;
      case "pdf":
        exportToPDF(data, filename, options);
        break;
    }
  };

  const exportToCSV = (
    data: any[],
    filename: string,
    options: ExportOptions,
  ) => {
    if (!data.length) return;

    const headers = options.includeHeaders
      ? Object.keys(data[0]).join(",") + "\n"
      : "";
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) => {
            const stringValue = String(value ?? "");
            const needsQuotes =
              stringValue.includes(",") || stringValue.includes('"');
            return needsQuotes
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(","),
      )
      .join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToExcel = (
    data: any[],
    filename: string,
    options: ExportOptions,
  ) => {
    const csvContent = exportToCSV(data, filename, options);
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xls`;
    link.click();
  };

  const exportToPDF = (
    data: any[],
    filename: string,
    options: ExportOptions,
  ) => {
    const tableRows = data
      .map((row) => {
        return Object.values(row)
          .map(
            (value) =>
              `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`,
          )
          .join("");
      })
      .join("</tr><tr>");

    const headers = options.includeHeaders
      ? Object.keys(data[0])
          .map(
            (key) =>
              `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${key}</th>`,
          )
          .join("")
      : "";

    const htmlContent = `
      <html>
        <head>
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <tr>${headers}</tr>
            ${tableRows}
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const selectedOption = exportOptions.find((opt) => opt.id === format);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {exportOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => {
                setFormat(option.id);
                setDialogOpen(true);
              }}
            >
              <option.icon className="h-4 w-4 mr-2" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export to {selectedOption?.label}</DialogTitle>
            <DialogDescription>{selectedOption?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <option.icon className="h-4 w-4" />
                    <div>
                      <div>{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Export Options</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeaders"
                  checked={options.includeHeaders}
                  onCheckedChange={(checked) =>
                    setOptions({
                      ...options,
                      includeHeaders: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="includeHeaders"
                  className="text-sm cursor-pointer"
                >
                  Include headers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) =>
                    setOptions({
                      ...options,
                      includeMetadata: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="includeMetadata"
                  className="text-sm cursor-pointer"
                >
                  Include metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="formatDate"
                  checked={options.formatDate}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, formatDate: checked as boolean })
                  }
                />
                <Label htmlFor="formatDate" className="text-sm cursor-pointer">
                  Format dates
                </Label>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {data.length} records
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
