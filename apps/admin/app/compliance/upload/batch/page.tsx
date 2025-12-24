"use client";

import { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import {
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  Building2,
  Loader2,
} from "lucide-react";

const INSTITUTIONS = [
  { id: "inst-001", name: "University of Texas" },
  { id: "inst-002", name: "University of Alabama" },
  { id: "inst-003", name: "Ohio State University" },
  { id: "inst-004", name: "University of Michigan" },
  { id: "inst-005", name: "University of Florida" },
  { id: "inst-006", name: "University of Georgia" },
  { id: "inst-007", name: "University of Oklahoma" },
  { id: "inst-008", name: "University of Southern California" },
];

const SPORTS = [
  "Football",
  "Basketball",
  "Baseball",
  "Soccer",
  "Track & Field",
  "Swimming",
  "Tennis",
  "Golf",
];

const ACADEMIC_YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
];

const STEPS = [
  { id: 1, title: "File Selection", icon: Upload },
  { id: 2, title: "Student Assignment", icon: UserPlus },
  { id: 3, title: "Institution Config", icon: Building2 },
  { id: 4, title: "Submit & Progress", icon: CheckCircle2 },
];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface StudentAssignment {
  fileId: string;
  studentId: string;
  studentName: string;
  sport: string;
  academicYear: string;
}

interface BatchProgress {
  current: number;
  total: number;
  status: "pending" | "processing" | "completed" | "error";
  completedItems: string[];
  errors: { fileId: string; error: string }[];
}

export default function BatchUploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [studentAssignments, setStudentAssignments] = useState<
    StudentAssignment[]
  >([]);
  const [sourceInstitution, setSourceInstitution] = useState("");
  const [targetInstitution, setTargetInstitution] = useState("");
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [],
  );

  const handleFiles = (fileList: FileList) => {
    if (files.length + fileList.length > 50) {
      alert("Maximum 50 files allowed");
      return;
    }

    const validFiles: UploadedFile[] = [];
    Array.from(fileList).forEach((file) => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        validFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          status: "error",
          progress: 0,
          error:
            "Invalid file type. Please upload PDF, JPEG, PNG, or DOCX files.",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        validFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          status: "error",
          progress: 0,
          error: "File size exceeds 10MB limit.",
        });
        return;
      }

      validFiles.push({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        status: "pending",
        progress: 0,
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);

    validFiles
      .filter((f) => f.status === "pending")
      .forEach((file) => simulateUpload(file.id));
  };

  const simulateUpload = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f)),
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "success", progress: 100 } : f,
          ),
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: Math.round(progress) } : f,
          ),
        );
      }
    }, 300);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setStudentAssignments((prev) => prev.filter((s) => s.fileId !== fileId));
  };

  const updateStudentAssignment = (
    fileId: string,
    field: keyof StudentAssignment,
    value: string,
  ) => {
    setStudentAssignments((prev) => {
      const existing = prev.find((s) => s.fileId === fileId);
      if (existing) {
        return prev.map((s) =>
          s.fileId === fileId ? { ...s, [field]: value } : s,
        );
      } else {
        return [
          ...prev,
          {
            fileId,
            studentId: "",
            studentName: "",
            sport: "",
            academicYear: "",
            [field]: value,
          },
        ];
      }
    });
  };

  const downloadCSVTemplate = () => {
    const template =
      "file_name,student_id,student_name,sport,academic_year\ntranscript_1.pdf,STU001,John Doe,Football,Sophomore\ntranscript_2.pdf,STU002,Jane Smith,Basketball,Junior";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1);
      const newAssignments: StudentAssignment[] = [];

      lines.forEach((line) => {
        const parts = line.split(",");
        if (parts.length >= 5) {
          const fileName = parts[0].trim();
          const existingFile = files.find((f) => f.name === fileName);
          if (existingFile) {
            newAssignments.push({
              fileId: existingFile.id,
              studentId: parts[1].trim(),
              studentName: parts[2].trim(),
              sport: parts[3].trim(),
              academicYear: parts[4].trim(),
            });
          }
        }
      });

      setStudentAssignments((prev) => {
        const merged = [...prev];
        newAssignments.forEach((newAssignment) => {
          const existingIndex = merged.findIndex(
            (s) => s.fileId === newAssignment.fileId,
          );
          if (existingIndex >= 0) {
            merged[existingIndex] = newAssignment;
          } else {
            merged.push(newAssignment);
          }
        });
        return merged;
      });
    };
    reader.readAsText(file);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const validFiles = files.filter((f) => f.status === "success");
      if (validFiles.length === 0) {
        alert("Please upload at least one valid transcript file");
        return;
      }
    }

    if (currentStep === 2) {
      const validFiles = files.filter((f) => f.status === "success");
      const assigned = studentAssignments.filter((s) =>
        files.find((f) => f.id === s.fileId && f.status === "success"),
      );
      if (assigned.length < validFiles.length) {
        alert("Please assign all files to students");
        return;
      }
    }

    if (currentStep === 3) {
      if (!sourceInstitution || !targetInstitution) {
        alert("Please select source and target institutions");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitBatch = () => {
    const validFiles = files.filter((f) => f.status === "success");
    setBatchProgress({
      current: 0,
      total: validFiles.length,
      status: "processing",
      completedItems: [],
      errors: [],
    });

    let completed = 0;
    const processNext = () => {
      if (completed < validFiles.length) {
        const file = validFiles[completed];
        setTimeout(
          () => {
            setBatchProgress((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                current: completed + 1,
                completedItems: [...prev.completedItems, file.id],
              };
            });
            completed++;
            processNext();
          },
          500 + Math.random() * 1000,
        );
      } else {
        setBatchProgress((prev) => {
          if (!prev) return null;
          return { ...prev, status: "completed" };
        });
      }
    };

    processNext();
  };

  const resetWizard = () => {
    setFiles([]);
    setStudentAssignments([]);
    setSourceInstitution("");
    setTargetInstitution("");
    setBatchProgress(null);
    setCurrentStep(1);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Batch Transcript Upload</h1>
        <p className="text-muted-foreground mt-2">
          Upload and assign multiple transcripts for evaluation
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep > step.id
                  ? "bg-green-500 border-green-500 text-white"
                  : currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <div className="hidden sm:block ml-2">
              <div
                className={`text-sm font-medium ${currentStep === step.id ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.title}
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight
                className={`h-5 w-5 mx-2 ${currentStep > step.id ? "text-green-500" : "text-muted-foreground"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: File Selection</CardTitle>
                <CardDescription>
                  Upload multiple transcript files (up to 50) or import from CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                  <Button
                    onClick={() => csvInputRef.current?.click()}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button onClick={downloadCSVTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="text-lg font-medium mb-2">
                    Drag and drop files here
                  </div>
                  <div className="text-sm text-muted-foreground">
                    PDF, JPEG, PNG, or DOCX (Max 50 files, 10MB each)
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                        uploaded
                      </span>
                      <span className="text-muted-foreground">
                        {files.filter((f) => f.status === "success").length}{" "}
                        complete
                      </span>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {file.status === "uploading" && (
                              <div className="w-24 text-xs text-muted-foreground">
                                {file.progress}%
                              </div>
                            )}
                            {file.status === "success" && (
                              <Check className="h-5 w-5 text-green-500" />
                            )}
                            {file.status === "error" && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <span className="text-xs text-destructive max-w-48">
                                  {file.error}
                                </span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Student Assignment</CardTitle>
                <CardDescription>
                  Map each uploaded file to a student record
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={downloadCSVTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                  <Button
                    onClick={() => csvInputRef.current?.click()}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Import from CSV
                  </Button>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {files
                    .filter((f) => f.status === "success")
                    .map((file) => {
                      const assignment = studentAssignments.find(
                        (s) => s.fileId === file.id,
                      ) || {
                        fileId: file.id,
                        studentId: "",
                        studentName: "",
                        sport: "",
                        academicYear: "",
                      };
                      return (
                        <div
                          key={file.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div className="font-medium">{file.name}</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Student ID</Label>
                              <Input
                                value={assignment.studentId}
                                onChange={(e) =>
                                  updateStudentAssignment(
                                    file.id,
                                    "studentId",
                                    e.target.value,
                                  )
                                }
                                placeholder="STU001"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Student Name</Label>
                              <Input
                                value={assignment.studentName}
                                onChange={(e) =>
                                  updateStudentAssignment(
                                    file.id,
                                    "studentName",
                                    e.target.value,
                                  )
                                }
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sport</Label>
                              <Select
                                value={assignment.sport}
                                onValueChange={(v) =>
                                  updateStudentAssignment(file.id, "sport", v)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sport" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SPORTS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Academic Year</Label>
                              <Select
                                value={assignment.academicYear}
                                onValueChange={(v) =>
                                  updateStudentAssignment(
                                    file.id,
                                    "academicYear",
                                    v,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ACADEMIC_YEARS.map((year) => (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Institution Configuration</CardTitle>
                <CardDescription>
                  Select source and target institutions for all files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Source Institution</Label>
                    <Select
                      value={sourceInstitution}
                      onValueChange={setSourceInstitution}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source institution" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTITUTIONS.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Institution</Label>
                    <Select
                      value={targetInstitution}
                      onValueChange={setTargetInstitution}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target institution" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTITUTIONS.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">File Summary</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {files
                      .filter((f) => f.status === "success")
                      .map((file) => {
                        const assignment = studentAssignments.find(
                          (s) => s.fileId === file.id,
                        );
                        return (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 rounded border bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">
                                  {file.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {assignment?.studentName &&
                                    `${assignment.studentName} • ${assignment.sport} • ${assignment.academicYear}`}
                                </div>
                              </div>
                            </div>
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Review & Submit</CardTitle>
                <CardDescription>
                  Review all assignments and submit for evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {files.filter((f) => f.status === "success").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transcripts
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {studentAssignments.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Students
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {INSTITUTIONS.find((i) => i.id === sourceInstitution)
                        ?.name || "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      →{" "}
                      {INSTITUTIONS.find((i) => i.id === targetInstitution)
                        ?.name || "-"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files
                    .filter((f) => f.status === "success")
                    .map((file) => {
                      const assignment = studentAssignments.find(
                        (s) => s.fileId === file.id,
                      );
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded border bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {file.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {assignment?.studentName &&
                                  `${assignment.studentName} (${assignment.studentId})`}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assignment?.sport} • {assignment?.academicYear}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {batchProgress ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {batchProgress.status === "completed"
                          ? "Processing complete!"
                          : `Processing ${batchProgress.current} of ${batchProgress.total}...`}
                      </span>
                      {batchProgress.status === "processing" && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                    {batchProgress.status === "completed" && (
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Batch submitted successfully!
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                          All {batchProgress.total} transcripts are now being
                          processed
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleSubmitBatch}
                    className="w-full"
                    size="lg"
                  >
                    Submit Batch for Evaluation
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {currentStep < 4 ? (
          <Button onClick={handleNextStep} disabled={batchProgress !== null}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={resetWizard}
            variant="outline"
            disabled={batchProgress?.status === "processing"}
          >
            Start New Batch
          </Button>
        )}
      </div>
    </div>
  );
}
