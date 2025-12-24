import http from "http";

export interface MockServerConfig {
  port: number;
  responses?: Array<{
    delay?: number;
    status: number;
    data: any;
    headers?: Record<string, string>;
  }>;
  responseHandler?: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => void;
}

export class MockServer {
  private server: http.Server | null = null;
  private requestCount = 0;
  private responses: MockServerConfig["responses"] = [];

  constructor(private config: MockServerConfig) {
    this.responses = config.responses || [];
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.requestCount++;

        if (this.config.responseHandler) {
          this.config.responseHandler(req, res);
          return;
        }

        const responseIndex =
          (this.requestCount - 1) % (this.responses?.length || 1);
        const response = this.responses?.[responseIndex];
        const delay = response?.delay || 0;

        if (delay > 0) {
          setTimeout(() => this.sendResponse(res, response), delay);
        } else {
          this.sendResponse(res, response);
        }
      });

      this.server.listen(this.config.port, () => {
        resolve();
      });

      this.server.on("error", reject);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getPort(): number {
    return this.config.port;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  reset(): void {
    this.requestCount = 0;
  }

  private sendResponse(
    res: http.ServerResponse,
    response?: { status: number; data: any; headers?: Record<string, string> },
  ): void {
    const status = response?.status || 200;
    const data = response?.data || {};
    const headers = response?.headers || { "Content-Type": "application/json" };

    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.statusCode = status;
    res.end(JSON.stringify(data));
  }
}

export const mockServers = {
  banner: {
    port: 3101,
    baseUrl: "http://localhost:3101",
  },
  peoplesoft: {
    port: 3102,
    baseUrl: "http://localhost:3102",
  },
  colleague: {
    port: 3103,
    baseUrl: "http://localhost:3103",
  },
  custom: {
    port: 3104,
    baseUrl: "http://localhost:3104",
  },
  webhook: {
    port: 3105,
    baseUrl: "http://localhost:3105",
  },
};

export function createBannerMockServer(): MockServer {
  return new MockServer({
    port: mockServers.banner.port,
    responses: [
      {
        status: 200,
        data: {
          sessionId: "banner-session-123",
          token: "banner-test-token",
          userId: "testuser",
        },
      },
      {
        status: 200,
        data: {
          studentId: "12345",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          program: "BSCS",
          major: "Computer Science",
        },
      },
      {
        status: 200,
        data: {
          studentId: "12345",
          studentName: "John Doe",
          program: "BSCS",
          major: "Computer Science",
          cumulativeGPA: 3.5,
          totalCredits: 120,
          earnedCredits: 120,
          gradeRecords: [],
        },
      },
    ],
  });
}

export function createPeopleSoftMockServer(): MockServer {
  return new MockServer({
    port: mockServers.peoplesoft.port,
    responses: [
      {
        status: 200,
        data: {
          JSESSIONID: "ps-session-456",
          token: "ps-test-token",
          userId: "psuser",
        },
      },
      {
        status: 200,
        data: {
          EMPLID: "67890",
          FIRST_NAME: "Jane",
          LAST_NAME: "Smith",
          EMAIL_ADDR: "jane@example.com",
          ACAD_PROG: "BSBA",
          ACAD_PLAN: "Business Admin",
          STRM: "202401",
        },
      },
      {
        status: 200,
        data: {
          EMPLID: "67890",
          NAME: "Jane Smith",
          ACAD_PROG: "BSBA",
          ACAD_PLAN: "Business Admin",
          CUM_GPA: 3.7,
          TOT_CUM_TAKEN: 120,
          TOT_CUM_EARNED: 120,
          GRADES: [],
        },
      },
    ],
  });
}

export function createColleagueMockServer(): MockServer {
  return new MockServer({
    port: mockServers.colleague.port,
    responses: [
      {
        status: 200,
        data: {
          sessionId: "coll-session-789",
          token: "coll-test-token",
          userId: "colluser",
        },
      },
      {
        status: 200,
        data: {
          studentId: "STU-123",
          firstName: "Robert",
          lastName: "Johnson",
          email: "robert@example.com",
          program: "BSENG",
          major: "Engineering",
        },
      },
      {
        status: 200,
        data: {
          studentId: "STU-123",
          studentName: "Robert Johnson",
          program: "BSENG",
          major: "Engineering",
          cumulativeGpa: 3.2,
          totalCredits: 90,
          earnedCredits: 90,
          grades: [],
        },
      },
    ],
  });
}

export function createCustomMockServer(): MockServer {
  return new MockServer({
    port: mockServers.custom.port,
    responses: [
      {
        status: 200,
        data: {
          token: "custom-token",
          sessionId: "custom-session",
        },
      },
      {
        status: 200,
        data: {
          id: "CUST-999",
          first_name: "Emily",
          last_name: "Davis",
          email_address: "emily@example.com",
          program_code: "BSART",
          major_code: "Art History",
        },
      },
    ],
  });
}

export function createWebhookMockServer(): MockServer {
  return new MockServer({
    port: mockServers.webhook.port,
    responseHandler: (req, res) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ received: true, webhook: JSON.parse(body) }));
      });
    },
  });
}

export async function startAllMockServers(): Promise<MockServer[]> {
  const servers: MockServer[] = [];

  const banner = createBannerMockServer();
  await banner.start();
  servers.push(banner);

  const ps = createPeopleSoftMockServer();
  await ps.start();
  servers.push(ps);

  const coll = createColleagueMockServer();
  await coll.start();
  servers.push(coll);

  const custom = createCustomMockServer();
  await custom.start();
  servers.push(custom);

  const webhook = createWebhookMockServer();
  await webhook.start();
  servers.push(webhook);

  return servers;
}

export async function stopAllMockServers(servers: MockServer[]): Promise<void> {
  await Promise.all(servers.map((server) => server.stop()));
}
