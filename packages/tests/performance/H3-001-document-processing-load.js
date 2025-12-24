import http from "k6/http";
import { check, sleep, SharedArray } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const errorRate = new Rate("errors");
const ocrDuration = new Trend("ocr_duration");
const processedCounter = new Counter("documents_processed");

const documents = new SharedArray("documents", function () {
  return JSON.parse(open("./data/transcripts.json"));
});

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "2m", target: 10 },
    { duration: "3m", target: 30 },
    { duration: "5m", target: 50 },
    { duration: "5m", target: 50 },
    { duration: "3m", target: 30 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.01"],
    ocr_duration: ["p(95)<36000"],
    http_req_duration: ["p(95)<36000"],
  },
};

export function setup() {
  console.log(`Starting Document Processing Load Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Documents available: ${documents.length}`);
}

export default function () {
  const doc = documents[__VU % documents.length];

  const startTimestamp = new Date().getTime();

  const payload = {
    files: {
      file: http.file(doc.content, doc.name, doc.type),
    },
  };

  const params = {
    headers: {
      Accept: "application/json",
    },
    timeout: "35m",
  };

  const response = http.post(`${BASE_URL}/documents/upload`, payload, params);
  const duration = new Date().getTime() - startTimestamp;

  const success = check(response, {
    "status is 201": () => response.status === 201,
    "has success field": () => {
      try {
        return JSON.parse(response.body).success === true;
      } catch (e) {
        return false;
      }
    },
    "has documentId": () => {
      try {
        return typeof JSON.parse(response.body).documentId === "string";
      } catch (e) {
        return false;
      }
    },
    "response time < 30min": () => duration < 1800000,
  });

  errorRate.add(!success);
  ocrDuration.add(duration);

  if (success) {
    processedCounter.add(1);
  }

  if (response.status === 0) {
    console.error(`Request failed: ${response.error}`);
  }

  sleep(1);
}

export function teardown() {
  console.log(`Document Processing Load Test Complete`);
  console.log(`Total documents processed: ${processedCounter.name}`);
}
