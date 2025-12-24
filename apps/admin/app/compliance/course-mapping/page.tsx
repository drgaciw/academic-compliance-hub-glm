"use client";

import { useState } from "react";
import { Button } from "@aah/ui";
import { Input } from "@aah/ui";
import { Label } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aah/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@aah/ui";
import {
  Search,
  Plus,
  FileDown,
  FileUp,
  Check,
  X,
  History,
  AlertTriangle,
} from "lucide-react";

type Course = {
  id: string;
  code: string;
  title: string;
  credits: number;
  institution: string;
};

type Mapping = {
  id: string;
  sourceCourse: Course;
  targetCourse: Course;
  confidenceScore: number;
  creditAdjustment: number;
  subjectArea: string;
  verificationStatus: "pending" | "approved" | "rejected";
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  effectiveDate: string;
  endDate?: string;
};

type MappingHistory = {
  id: string;
  mappingId: string;
  previousVersion: Mapping;
  changeDate: string;
  changedBy: string;
  changeType: "created" | "modified" | "expired";
};

const SUBJECT_AREAS = [
  "Mathematics",
  "English",
  "Science",
  "History",
  "Social Studies",
  "Fine Arts",
  "Physical Education",
  "Computer Science",
  "Foreign Language",
  "Business",
];

const mockSourceCourses: Course[] = [
  {
    id: "1",
    code: "ENG101",
    title: "English Composition I",
    credits: 3,
    institution: "Source High School",
  },
  {
    id: "2",
    code: "MATH101",
    title: "College Algebra",
    credits: 4,
    institution: "Source High School",
  },
  {
    id: "3",
    code: "SCI201",
    title: "Introduction to Biology",
    credits: 4,
    institution: "Source High School",
  },
  {
    id: "4",
    code: "HIST101",
    title: "World History",
    credits: 3,
    institution: "Source High School",
  },
  {
    id: "5",
    code: "CS101",
    title: "Introduction to Programming",
    credits: 3,
    institution: "Source High School",
  },
];

const mockTargetCourses: Course[] = [
  {
    id: "101",
    code: "ENGL1101",
    title: "English Composition I",
    credits: 3,
    institution: "Target University",
  },
  {
    id: "102",
    code: "MATH1101",
    title: "College Algebra",
    credits: 3,
    institution: "Target University",
  },
  {
    id: "103",
    code: "BIOL1010",
    title: "Principles of Biology",
    credits: 4,
    institution: "Target University",
  },
  {
    id: "104",
    code: "HIST1001",
    title: "World Civilization I",
    credits: 3,
    institution: "Target University",
  },
  {
    id: "105",
    code: "CS1010",
    title: "Programming Fundamentals",
    credits: 4,
    institution: "Target University",
  },
];

const mockMappings: Mapping[] = [
  {
    id: "m1",
    sourceCourse: mockSourceCourses[0],
    targetCourse: mockTargetCourses[0],
    confidenceScore: 95,
    creditAdjustment: 3,
    subjectArea: "English",
    verificationStatus: "approved",
    verifiedBy: "admin@university.edu",
    verifiedAt: "2024-12-20T10:30:00Z",
    effectiveDate: "2024-01-01",
  },
  {
    id: "m2",
    sourceCourse: mockSourceCourses[1],
    targetCourse: mockTargetCourses[1],
    confidenceScore: 85,
    creditAdjustment: 3,
    subjectArea: "Mathematics",
    verificationStatus: "approved",
    verifiedBy: "admin@university.edu",
    verifiedAt: "2024-12-20T11:00:00Z",
    effectiveDate: "2024-01-01",
  },
  {
    id: "m3",
    sourceCourse: mockSourceCourses[2],
    targetCourse: mockTargetCourses[2],
    confidenceScore: 65,
    creditAdjustment: 4,
    subjectArea: "Science",
    verificationStatus: "pending",
    effectiveDate: "2024-01-01",
  },
];

const mockMappingHistory: MappingHistory[] = [
  {
    id: "h1",
    mappingId: "m1",
    previousVersion: { ...mockMappings[0], confidenceScore: 92 },
    changeDate: "2024-12-20T10:30:00Z",
    changedBy: "admin@university.edu",
    changeType: "created",
  },
];

export default function CourseMappingPage() {
  const [activeTab, setActiveTab] = useState("editor");
  const [mappings, setMappings] = useState<Mapping[]>(mockMappings);
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null);
  const [searchResults, setSearchResults] = useState<{
    source?: Course[];
    target?: Course[];
  }>({});
  const [selectedSourceCourse, setSelectedSourceCourse] =
    useState<Course | null>(null);
  const [selectedTargetCourse, setSelectedTargetCourse] =
    useState<Course | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState<number>(0);
  const [subjectArea, setSubjectArea] = useState<string>("");
  const [verificationNotes, setVerificationNotes] = useState<string>("");

  const handleSearch = (query: string, type: "source" | "target") => {
    const courses = type === "source" ? mockSourceCourses : mockTargetCourses;
    const filtered = courses.filter(
      (course) =>
        course.code.toLowerCase().includes(query.toLowerCase()) ||
        course.title.toLowerCase().includes(query.toLowerCase()),
    );
    setSearchResults((prev) => ({
      ...prev,
      [type]: query ? filtered : undefined,
    }));
  };

  const handleCreateMapping = () => {
    if (selectedSourceCourse && selectedTargetCourse) {
      const newMapping: Mapping = {
        id: `m${Date.now()}`,
        sourceCourse: selectedSourceCourse,
        targetCourse: selectedTargetCourse,
        confidenceScore: Math.floor(Math.random() * 30) + 70,
        creditAdjustment: creditAdjustment || selectedTargetCourse.credits,
        subjectArea,
        verificationStatus: confidenceScore < 70 ? "pending" : "approved",
        verifiedBy: confidenceScore >= 70 ? "current_user" : undefined,
        verifiedAt:
          confidenceScore >= 70 ? new Date().toISOString() : undefined,
        effectiveDate: new Date().toISOString().split("T")[0],
      };
      setMappings([...mappings, newMapping]);
      setSelectedSourceCourse(null);
      setSelectedTargetCourse(null);
      setCreditAdjustment(0);
      setSubjectArea("");
    }
  };

  const handleApproveMapping = (mappingId: string) => {
    setMappings(
      mappings.map((m) =>
        m.id === mappingId
          ? {
              ...m,
              verificationStatus: "approved" as const,
              verifiedBy: "current_user",
              verifiedAt: new Date().toISOString(),
              verificationNotes,
            }
          : m,
      ),
    );
    setVerificationNotes("");
  };

  const handleRejectMapping = (mappingId: string) => {
    setMappings(
      mappings.map((m) =>
        m.id === mappingId
          ? {
              ...m,
              verificationStatus: "rejected" as const,
              verifiedBy: "current_user",
              verifiedAt: new Date().toISOString(),
              verificationNotes,
            }
          : m,
      ),
    );
    setVerificationNotes("");
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 90)
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          High
        </span>
      );
    if (score >= 70)
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Medium
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Low
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Source Code",
      "Source Title",
      "Target Code",
      "Target Title",
      "Confidence Score",
      "Credit Adjustment",
      "Subject Area",
      "Status",
    ];
    const rows = mappings.map((m) => [
      m.sourceCourse.code,
      m.sourceCourse.title,
      m.targetCourse.code,
      m.targetCourse.title,
      m.confidenceScore,
      m.creditAdjustment,
      m.subjectArea,
      m.verificationStatus,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "course-mappings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceScore =
    selectedSourceCourse && selectedTargetCourse
      ? Math.floor(Math.random() * 30) + 70
      : 0;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Course Mapping Editor</h1>
        <p className="text-muted-foreground">
          Manage course equivalencies between institutions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="editor">Mapping Editor</TabsTrigger>
          <TabsTrigger value="list">View All Mappings</TabsTrigger>
          <TabsTrigger value="batch">Batch Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Source Course</CardTitle>
                <CardDescription>
                  Search and select the source course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code or title..."
                    className="pl-10"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSearch(e.target.value, "source")
                    }
                  />
                </div>
                {searchResults.source && (
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {searchResults.source.map((course) => (
                      <div
                        key={course.id}
                        className={`p-3 hover:bg-accent cursor-pointer ${selectedSourceCourse?.id === course.id ? "bg-accent" : ""}`}
                        onClick={() => setSelectedSourceCourse(course)}
                      >
                        <div className="font-medium">{course.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {course.institution} • {course.credits} credits
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedSourceCourse && (
                  <div className="p-4 bg-muted rounded-md">
                    <div className="font-medium">
                      {selectedSourceCourse.code} - {selectedSourceCourse.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSourceCourse.institution} •{" "}
                      {selectedSourceCourse.credits} credits
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Course</CardTitle>
                <CardDescription>
                  Search and select the target course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code or title..."
                    className="pl-10"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSearch(e.target.value, "target")
                    }
                  />
                </div>
                {searchResults.target && (
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {searchResults.target.map((course) => (
                      <div
                        key={course.id}
                        className={`p-3 hover:bg-accent cursor-pointer ${selectedTargetCourse?.id === course.id ? "bg-accent" : ""}`}
                        onClick={() => setSelectedTargetCourse(course)}
                      >
                        <div className="font-medium">{course.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {course.institution} • {course.credits} credits
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTargetCourse && (
                  <div className="p-4 bg-muted rounded-md">
                    <div className="font-medium">
                      {selectedTargetCourse.code} - {selectedTargetCourse.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTargetCourse.institution} •{" "}
                      {selectedTargetCourse.credits} credits
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedSourceCourse && selectedTargetCourse && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mapping Details</CardTitle>
                <CardDescription>
                  Configure the course equivalency mapping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Confidence Score</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {getConfidenceBadge(confidenceScore)}
                      <span className="text-2xl font-bold">
                        {confidenceScore}%
                      </span>
                    </div>
                  </div>
                  {confidenceScore < 70 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Low confidence mapping requires manual verification
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="credits">Credit Adjustment</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={creditAdjustment}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCreditAdjustment(Number(e.target.value))
                      }
                      placeholder={selectedTargetCourse.credits.toString()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Original target credits: {selectedTargetCourse.credits}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject Area</Label>
                    <Select value={subjectArea} onValueChange={setSubjectArea}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject area" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECT_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCreateMapping}
                  disabled={!selectedSourceCourse || !selectedTargetCourse}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mapping
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {mappings.map((mapping) => (
              <Card key={mapping.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          {getConfidenceBadge(mapping.confidenceScore)}
                          <span className="font-semibold">
                            {mapping.confidenceScore}%
                          </span>
                        </div>
                        {getStatusBadge(mapping.verificationStatus)}
                        {mapping.confidenceScore < 70 &&
                          mapping.verificationStatus === "pending" && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Requires Review</span>
                            </div>
                          )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Source
                          </div>
                          <div className="font-medium">
                            {mapping.sourceCourse.code}
                          </div>
                          <div className="text-sm">
                            {mapping.sourceCourse.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {mapping.sourceCourse.institution} •{" "}
                            {mapping.sourceCourse.credits} credits
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Target
                          </div>
                          <div className="font-medium">
                            {mapping.targetCourse.code}
                          </div>
                          <div className="text-sm">
                            {mapping.targetCourse.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {mapping.targetCourse.institution} •{" "}
                            {mapping.targetCourse.credits} credits
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Credit Adjustment:
                          </span>
                          <span className="ml-2 font-medium">
                            {mapping.creditAdjustment}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Subject Area:
                          </span>
                          <span className="ml-2 font-medium">
                            {mapping.subjectArea}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Effective:
                          </span>
                          <span className="ml-2 font-medium">
                            {mapping.effectiveDate}
                          </span>
                        </div>
                      </div>

                      {mapping.verificationNotes && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Verification Notes:
                          </div>
                          <div className="text-sm">
                            {mapping.verificationNotes}
                          </div>
                        </div>
                      )}

                      {mapping.verifiedBy && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Verified by {mapping.verifiedBy} on{" "}
                          {new Date(mapping.verifiedAt!).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4 mr-2" />
                            History
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mapping History</DialogTitle>
                            <DialogDescription>
                              View changes to this mapping over time
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {mockMappingHistory
                              .filter((h) => h.mappingId === mapping.id)
                              .map((history) => (
                                <div
                                  key={history.id}
                                  className="p-4 border rounded-md"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium capitalize">
                                      {history.changeType}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        history.changeDate,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    By {history.changedBy}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {mapping.confidenceScore < 70 &&
                        mapping.verificationStatus === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMapping(mapping)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedMapping(mapping)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                    </div>
                  </div>

                  {selectedMapping?.id === mapping.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div>
                        <Label htmlFor="notes">Verification Notes</Label>
                        <Input
                          id="notes"
                          value={verificationNotes}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setVerificationNotes(e.target.value)
                          }
                          placeholder="Add verification notes..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveMapping(mapping.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirm Approval
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectMapping(mapping.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedMapping(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Mappings</CardTitle>
                <CardDescription>
                  Import course mappings from a CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                  <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    Drag and drop a CSV file here, or click to select
                  </p>
                  <Button variant="outline">Select CSV File</Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    CSV format: Source Code, Source Title, Target Code, Target
                    Title, Credit Adjustment, Subject Area
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Mappings</CardTitle>
                <CardDescription>
                  Export all current mappings to CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Export {mappings.length} mappings
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Includes all mappings with verification status and
                      confidence scores
                    </p>
                  </div>
                  <Button onClick={handleExportCSV}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Status</CardTitle>
                <CardDescription>
                  Recent batch operation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Last import: 25 mappings processed successfully</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-red-600" />
                    <span>
                      2 mappings failed validation (duplicate courses)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>
                      Last export: {mappings.length} mappings exported to CSV
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
