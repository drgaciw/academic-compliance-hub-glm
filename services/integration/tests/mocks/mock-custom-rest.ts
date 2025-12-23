import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3104;

app.use(bodyParser.json());

interface Endpoint {
  method: string;
  path: string;
  response: any;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/students/:id",
    response: {
      id: ":id",
      name: "Custom System Student",
      email: "student@custom.edu",
      major: "Undeclared",
      status: "Active",
    },
  },
  {
    method: "GET",
    path: "/students/:id/transcript",
    response: {
      studentId: ":id",
      name: "Custom System Student",
      institution: "Custom SIS",
      gpa: 3.5,
      credits: 60,
      courses: [
        { code: "GEN101", title: "General Education", credits: 3, grade: "A" },
        {
          code: "GEN102",
          title: "General Education II",
          credits: 3,
          grade: "B",
        },
      ],
      academicStanding: "Good Standing",
    },
  },
  {
    method: "POST",
    path: "/evaluations",
    response: {
      success: true,
      evaluationId: "CUSTOM-EVAL-{timestamp}",
      message: "Evaluation submitted to custom system",
    },
  },
];

let webhookUrl: string | null = null;
let evaluations: any[] = [];

app.all("*", (req, res, next) => {
  console.log(`[Custom REST Mock] ${req.method} ${req.path}`);

  if (req.path === "/config/endpoints" && req.method === "GET") {
    res.json(endpoints);
    return;
  }

  if (req.path === "/config/endpoints" && req.method === "POST") {
    const newEndpoint: Endpoint = req.body;
    endpoints.push(newEndpoint);
    res.json({ success: true, message: "Endpoint configured", endpoints });
    return;
  }

  if (req.path === "/webhook" && req.method === "POST") {
    webhookUrl = req.body.url;
    res.json({ success: true, message: "Webhook registered" });
    return;
  }

  if (req.path === "/evaluations" && req.method === "POST") {
    const evaluation = {
      id: `CUSTOM-EVAL-${Date.now()}`,
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
      console.log(`[Custom REST Mock] Sending webhook to ${webhookUrl}`);
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "evaluation.received", data: evaluation }),
      }).catch((err) =>
        console.error("[Custom REST Mock] Webhook error:", err),
      );
    }
    return;
  }

  if (req.path === "/evaluations" && req.method === "GET") {
    res.json(evaluations);
    return;
  }

  if (req.path === "/health") {
    res.json({ status: "healthy", service: "Custom REST Mock", port: PORT });
    return;
  }

  const matchedEndpoint = endpoints.find((ep) => {
    const pathPattern = ep.path.replace(":id", ".*");
    const regex = new RegExp(`^${pathPattern}$`);
    return ep.method === req.method && regex.test(req.path);
  });

  if (matchedEndpoint) {
    const response = JSON.parse(JSON.stringify(matchedEndpoint.response));
    Object.keys(response).forEach((key) => {
      if (response[key] === ":id") {
        const match = req.path.match(/\d+/);
        response[key] = match ? match[0] : "12345";
      }
      if (
        typeof response[key] === "string" &&
        response[key].includes("{timestamp}")
      ) {
        response[key] = response[key].replace(
          "{timestamp}",
          Date.now().toString(),
        );
      }
    });
    res.json(response);
  } else {
    next();
  }
});

app.use((req, res) => {
  res.status(404).json({
    error:
      "Endpoint not configured. Use POST /config/endpoints to add endpoints.",
  });
});

app.listen(PORT, () => {
  console.log(`Custom REST Mock Server running on http://localhost:${PORT}`);
  console.log(`Configurable: POST /config/endpoints to add custom endpoints`);
});
