import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const outputDir = "./data";
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const transcripts = [];
for (let i = 0; i < 50; i++) {
  transcripts.push({
    id: `transcript_${i + 1}`,
    name: `transcript_${i + 1}.pdf`,
    type: "application/pdf",
    content: Buffer.from(`Sample transcript content ${i + 1}`).toString(
      "base64",
    ),
    pages: Math.floor(Math.random() * 10) + 5,
  });
}

writeFileSync(
  join(outputDir, "transcripts.json"),
  JSON.stringify(transcripts, null, 2),
);

console.log(`Generated ${transcripts.length} sample transcripts`);

const students = [];
const majors = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
];
const years = ["Freshman", "Sophomore", "Junior", "Senior"];

for (let i = 0; i < 100; i++) {
  students.push({
    id: `student_${i + 1}`,
    name: `Student ${i + 1}`,
    gpa: (Math.random() * 4.0).toFixed(2),
    creditHours: Math.floor(Math.random() * 120),
    major: majors[Math.floor(Math.random() * majors.length)],
    year: years[Math.floor(Math.random() * years.length)],
    eligibility: Math.random() > 0.1,
  });
}

writeFileSync(
  join(outputDir, "students.json"),
  JSON.stringify(students, null, 2),
);

console.log(`Generated ${students.length} sample students`);

const endpoints = [
  { method: "GET", path: "/health", body: null },
  { method: "GET", path: "/compliance/health", body: null },
  { method: "GET", path: "/documents/health", body: null },
  {
    method: "GET",
    path: "/compliance/students/student_1/compliance",
    body: null,
  },
  {
    method: "GET",
    path: "/compliance/students/student_1/eligibility",
    body: null,
  },
  {
    method: "GET",
    path: "/compliance/students/student_2/compliance",
    body: null,
  },
  {
    method: "GET",
    path: "/compliance/students/student_2/eligibility",
    body: null,
  },
  {
    method: "POST",
    path: "/compliance/students/student_1/compliance",
    body: { category: "GPA", requirement: "Minimum 2.0", status: "COMPLETED" },
  },
  {
    method: "POST",
    path: "/compliance/students/student_2/compliance",
    body: {
      category: "Credits",
      requirement: "120 credits",
      status: "PENDING",
    },
  },
  { method: "GET", path: "/course-mapping/health", body: null },
  {
    method: "POST",
    path: "/course-mapping/search",
    body: {
      query_vector: Array(1536)
        .fill(0)
        .map(() => Math.random()),
      limit: 10,
      threshold: 0.7,
    },
  },
];

writeFileSync(
  join(outputDir, "api-endpoints.json"),
  JSON.stringify(endpoints, null, 2),
);

console.log(`Generated ${endpoints.length} API endpoints`);
