import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3105;

app.use(bodyParser.json());

const UPLOAD_DIR = path.join(__dirname, "mock-sftp-uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const files: any[] = [
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

let webhookUrl: string | null = null;

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

  const localPath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(localPath, content || "");

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
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.delete("/files/:filename", (req, res) => {
  console.log(`[SFTP Mock] DELETE /files/${req.params.filename}`);
  const index = files.findIndex((f) => f.name === req.params.filename);

  if (index !== -1) {
    const file = files.splice(index, 1)[0];
    const localPath = path.join(UPLOAD_DIR, req.params.filename);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    res.json({ success: true, message: "File deleted", file });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.post("/download", (req, res) => {
  console.log(`[SFTP Mock] POST /download`, req.body);
  const { filename } = req.body;
  const file = files.find((f) => f.name === filename);

  if (file) {
    const localPath = path.join(UPLOAD_DIR, filename);
    let content = "";
    if (fs.existsSync(localPath)) {
      content = fs.readFileSync(localPath, "utf-8");
    }
    res.json({ success: true, file, content });
  } else {
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
