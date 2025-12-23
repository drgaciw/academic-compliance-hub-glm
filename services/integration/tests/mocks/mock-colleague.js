"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const PORT = 3103;
app.use(body_parser_1.default.json());
const sampleTranscript = {
    studentId: "12345",
    name: "John Doe",
    institution: "Colleague College",
    gpa: 3.82,
    credits: 118,
    courses: [
        {
            code: "CSC101",
            title: "Programming Fundamentals",
            credits: 4,
            grade: "A",
        },
        { code: "MAT150", title: "Discrete Mathematics", credits: 4, grade: "A" },
        { code: "ENG102", title: "Academic Writing", credits: 3, grade: "A-" },
        { code: "BIO101", title: "Biology Fundamentals", credits: 4, grade: "A-" },
    ],
    academicStanding: "Excellent Standing",
};
const students = {
    "12345": {
        id: "12345",
        name: "John Doe",
        email: "john.doe@colleague.edu",
        major: "Computer Science",
        status: "Active",
        enrollmentDate: "2020-08-15",
    },
    "67890": {
        id: "67890",
        name: "Jane Smith",
        email: "jane.smith@colleague.edu",
        major: "Biology",
        status: "Active",
        enrollmentDate: "2021-08-15",
    },
};
let evaluations = [];
let webhookUrl = null;
app.get("/students/:id", (req, res) => {
    console.log(`[Colleague Mock] GET /students/${req.params.id}`);
    const student = students[req.params.id];
    if (student) {
        res.json(student);
    }
    else {
        res.status(404).json({ error: "Student not found" });
    }
});
app.get("/students/:id/transcript", (req, res) => {
    console.log(`[Colleague Mock] GET /students/${req.params.id}/transcript`);
    const student = students[req.params.id];
    if (student) {
        res.json({
            ...sampleTranscript,
            studentId: req.params.id,
            name: student.name,
        });
    }
    else {
        res.status(404).json({ error: "Student not found" });
    }
});
app.post("/evaluations", (req, res) => {
    console.log(`[Colleague Mock] POST /evaluations`, req.body);
    const evaluation = {
        id: `COL-EVAL-${Date.now()}`,
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
        console.log(`[Colleague Mock] Sending webhook to ${webhookUrl}`);
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "evaluation.received", data: evaluation }),
        }).catch((err) => console.error("[Colleague Mock] Webhook error:", err));
    }
});
app.post("/webhook", (req, res) => {
    console.log(`[Colleague Mock] POST /webhook`, req.body);
    webhookUrl = req.body.url;
    res.json({ success: true, message: "Webhook registered" });
});
app.get("/evaluations", (req, res) => {
    console.log(`[Colleague Mock] GET /evaluations`);
    res.json(evaluations);
});
app.get("/health", (req, res) => {
    res.json({ status: "healthy", service: "Colleague Mock", port: PORT });
});
app.use((req, res) => {
    console.log(`[Colleague Mock] ${req.method} ${req.path}`);
    res.status(404).json({ error: "Endpoint not found" });
});
app.listen(PORT, () => {
    console.log(`Colleague Mock Server running on http://localhost:${PORT}`);
});
