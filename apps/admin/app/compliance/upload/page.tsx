"use client";

import { useState, useCallback } from "react";
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
  Search,
  Plus,
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

const ACADEMIC_YERS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [sourceInstitution, setSourceInstitution] = useState("");
  const [targetInstitution, setTargetInstitution] = useState("");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [sport, setSport] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [gpaOverride, setGpaOverride] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const filteredInstitutions = INSTITUTIONS.filter((inst) =>
    inst.name.toLowerCase().includes(institutionSearch.toLowerCase()),
  );

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !sourceInstitution ||
      !targetInstitution ||
      !studentId ||
      !studentName ||
      !sport ||
      !academicYear
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (files.length === 0) {
      alert("Please upload at least one transcript");
      return;
    }

    const hasErrors = files.some((f) => f.status === "error");
    if (hasErrors) {
      alert("Please fix file upload errors before submitting");
      return;
    }

    alert("Transcripts uploaded successfully!");
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
        <h1 className="text-3xl font-bold">Upload Transcripts</h1>
        <p className="text-muted-foreground mt-2">
          Upload student transcripts for eligibility evaluation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Institution Selection</CardTitle>
            <CardDescription>
              Select the source and target institutions for transfer credit
              evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="source-institution">
                Source Institution <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="source-institution"
                  placeholder="Search or select source institution..."
                  className="pl-10"
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                />
              </div>
              <Select
                value={sourceInstitution}
                onValueChange={setSourceInstitution}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {filteredInstitutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-institution">
                Target Institution <span className="text-destructive">*</span>
              </Label>
              <Select
                value={targetInstitution}
                onValueChange={setTargetInstitution}
              >
                <SelectTrigger id="target-institution">
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

            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add New Institution
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Enter student metadata for the evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-id">
                Student ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student-id"
                placeholder="Enter student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-name">
                Student Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student-name"
                placeholder="Enter student name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">
                  Sport <span className="text-destructive">*</span>
                </Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger id="sport">
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
                <Label htmlFor="year">
                  Academic Year <span className="text-destructive">*</span>
                </Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YERS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa-override">GPA Override (Optional)</Label>
              <Input
                id="gpa-override"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                placeholder="Enter override GPA if needed"
                value={gpaOverride}
                onChange={(e) => setGpaOverride(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use only when transcript GPA calculation requires manual
                correction
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transcript Upload</CardTitle>
          <CardDescription>
            Upload transcript files (PDF, JPEG, PNG, DOCX). Maximum 50 files,
            10MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="text-sm text-muted-foreground mb-4">or</div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button type="button" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {files.length} file{files.length !== 1 ? "s" : ""} uploaded
                </span>
                <span className="text-muted-foreground">
                  {files.filter((f) => f.status === "success").length} complete
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
                      <div className="font-medium truncate">{file.name}</div>
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

          <div className="flex justify-end">
            <form onSubmit={handleSubmit}>
              <Button
                type="submit"
                disabled={
                  files.length === 0 ||
                  files.some((f) => f.status === "uploading")
                }
              >
                Upload Transcripts
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
