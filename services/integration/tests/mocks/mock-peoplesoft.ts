import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3102;

app.use(bodyParser.json());

const sampleTranscript = {
  studentId: "12345",
  name: "John Doe",
  institution: "PeopleSoft University",
  gpa: 3.68,
  credits: 124,
  courses: [
    {
      code: "CS105",
      title: "Computer Science Fundamentals",
      credits: 4,
      grade: "A",
    },
    {
      code: "MATH205",
      title: "Multivariable Calculus",
      credits: 4,
      grade: "B",
    },
    { code: "ENG201", title: "Technical Writing", credits: 3, grade: "A-" },
    { code: "CHEM101", title: "General Chemistry", credits: 4, grade: "B+" },
  ],
  academicStanding: "Good Standing",
};

const students = {
  "12345": {
    id: "12345",
    name: "John Doe",
    email: "john.doe@peoplesoft.edu",
    major: "Computer Science",
    status: "Active",
    enrollmentDate: "2020-08-15",
  },
  "67890": {
    id: "67890",
    name: "Jane Smith",
    email: "jane.smith@peoplesoft.edu",
    major: "Physics",
    status: "Active",
    enrollmentDate: "2021-08-15",
  },
};

let evaluations: any[] = [];
let webhookUrl: string | null = null;

app.get("/students/:id", (req, res) => {
  console.log(`[PeopleSoft Mock] GET /students/${req.params.id}`);
  const student = students[req.params.id];

  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

app.get("/students/:id/transcript", (req, res) => {
  console.log(`[PeopleSoft Mock] GET /students/${req.params.id}/transcript`);
  const student = students[req.params.id];

  if (student) {
    res.json({
      ...sampleTranscript,
      studentId: req.params.id,
      name: student.name,
    });
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

app.post("/evaluations", (req, res) => {
  console.log(`[PeopleSoft Mock] POST /evaluations`, req.body);
  const evaluation = {
    id: `PS-EVAL-${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString(),
    status: "Received",
  };
  evaluations.push(evaluation);

  res.status(202).json({
    success: true,
    evaluationId: evaluation.id,
    message: "Evaluation submitted successfully",
  });

  if (webhookUrl) {
    console.log(`[PeopleSoft Mock] Sending webhook to ${webhookUrl}`);
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "evaluation.received", data: evaluation }),
    }).catch((err) => console.error("[PeopleSoft Mock] Webhook error:", err));
  }
});

app.post("/webhook", (req, res) => {
  console.log(`[PeopleSoft Mock] POST /webhook`, req.body);
  webhookUrl = req.body.url;
  res.json({ success: true, message: "Webhook registered" });
});

app.get("/evaluations", (req, res) => {
  console.log(`[PeopleSoft Mock] GET /evaluations`);
  res.json(evaluations);
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "PeopleSoft Mock", port: PORT });
});

app.use((req, res) => {
  console.log(`[PeopleSoft Mock] ${req.method} ${req.path}`);
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`PeopleSoft Mock Server running on http://localhost:${PORT}`);
});
