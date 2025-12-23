"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3105;
app.use(body_parser_1.default.json());
const UPLOAD_DIR = path_1.default.join(__dirname, "mock-sftp-uploads");
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const files = [
    {
        name: "transcript_12345.pdf",
        path: "/uploads/transcript_12345.pdf",
        size: 102400,
        modified: "2024-01-15T10:30:00Z",
        type: "application/pdf",
    },
    {
        name: "evaluation_batch_001.csv",
        path: "/uploads/evaluation_batch_001.csv",
        size: 5120,
        modified: "2024-01-14T14:20:00Z",
        type: "text/csv",
    },
];
let webhookUrl = null;
app.post("/upload", (req, res) => {
    console.log(`[SFTP Mock] POST /upload`, req.body);
    const { filename, content, path: filePath } = req.body;
    const file = {
        name: filename,
        path: filePath || `/uploads/${filename}`,
        size: Buffer.byteLength(content || ""),
        modified: new Date().toISOString(),
        type: "application/octet-stream",
    };
    files.push(file);
    const localPath = path_1.default.join(UPLOAD_DIR, filename);
    fs_1.default.writeFileSync(localPath, content || "");
    res.json({
        success: true,
        file,
        message: "File uploaded via SFTP mock",
    });
    if (webhookUrl) {
        console.log(`[SFTP Mock] Sending webhook to ${webhookUrl}`);
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "file.uploaded", data: file }),
        }).catch((err) => console.error("[SFTP Mock] Webhook error:", err));
    }
});
app.get("/files", (req, res) => {
    console.log(`[SFTP Mock] GET /files`);
    res.json({ files, total: files.length });
});
app.get("/files/:filename", (req, res) => {
    console.log(`[SFTP Mock] GET /files/${req.params.filename}`);
    const file = files.find((f) => f.name === req.params.filename);
    if (file) {
        res.json(file);
    }
    else {
        res.status(404).json({ error: "File not found" });
    }
});
app.delete("/files/:filename", (req, res) => {
    console.log(`[SFTP Mock] DELETE /files/${req.params.filename}`);
    const index = files.findIndex((f) => f.name === req.params.filename);
    if (index !== -1) {
        const file = files.splice(index, 1)[0];
        const localPath = path_1.default.join(UPLOAD_DIR, req.params.filename);
        if (fs_1.default.existsSync(localPath)) {
            fs_1.default.unlinkSync(localPath);
        }
        res.json({ success: true, message: "File deleted", file });
    }
    else {
        res.status(404).json({ error: "File not found" });
    }
});
app.post("/download", (req, res) => {
    console.log(`[SFTP Mock] POST /download`, req.body);
    const { filename } = req.body;
    const file = files.find((f) => f.name === filename);
    if (file) {
        const localPath = path_1.default.join(UPLOAD_DIR, filename);
        let content = "";
        if (fs_1.default.existsSync(localPath)) {
            content = fs_1.default.readFileSync(localPath, "utf-8");
        }
        res.json({ success: true, file, content });
    }
    else {
        res.status(404).json({ error: "File not found" });
    }
});
app.post("/webhook", (req, res) => {
    console.log(`[SFTP Mock] POST /webhook`, req.body);
    webhookUrl = req.body.url;
    res.json({ success: true, message: "Webhook registered" });
});
app.get("/health", (req, res) => {
    res.json({ status: "healthy", service: "SFTP Mock", port: PORT });
});
app.use((req, res) => {
    console.log(`[SFTP Mock] ${req.method} ${req.path}`);
    res.status(404).json({ error: "SFTP endpoint not found" });
});
app.listen(PORT, () => {
    console.log(`SFTP Mock Server running on http://localhost:${PORT}`);
    console.log(`Upload directory: ${UPLOAD_DIR}`);
});
