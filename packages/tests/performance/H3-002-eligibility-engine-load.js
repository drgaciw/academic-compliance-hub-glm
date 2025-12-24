import http from "k6/http";
import { check, sleep, SharedArray } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const errorRate = new Rate("errors");
const evaluationDuration = new Trend("evaluation_duration");
const cpuUsage = new Trend("cpu_usage");
const memoryUsage = new Trend("memory_usage");
const evaluationCounter = new Counter("evaluations_completed");

const students = new SharedArray("students", function () {
  return JSON.parse(open("./data/students.json"));
});

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "1m", target: 20 },
    { duration: "2m", target: 50 },
    { duration: "3m", target: 100 },
    { duration: "4m", target: 100 },
    { duration: "2m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.01"],
    evaluation_duration: ["p(95)<5000"],
    http_req_duration: ["p(95)<5000"],
  },
};

export function setup() {
  console.log(`Starting Eligibility Engine Load Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Students available: ${students.length}`);
}

export default function () {
  const student = students[__VU % students.length];

  const endpoints = [
    `/compliance/students/${student.id}/eligibility`,
    `/compliance/students/${student.id}/compliance`,
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const startTimestamp = new Date().getTime();

  const params = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  let response;

  if (endpoint.includes("eligibility")) {
    response = http.get(`${BASE_URL}${endpoint}`, params);
  } else {
    const payload = JSON.stringify({
      category: "GPA Requirement",
      requirement: "Minimum 2.0 GPA",
      status: "COMPLETED",
      notes: "Performance test evaluation",
    });
    response = http.post(`${BASE_URL}${endpoint}`, payload, params);
  }

  const duration = new Date().getTime() - startTimestamp;

  const success = check(response, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
    "has success field": (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch (e) {
        return false;
      }
    },
    "response time < 5s": (r) => duration < 5000,
  });

  errorRate.add(!success);
  evaluationDuration.add(duration);

  if (success) {
    evaluationCounter.add(1);
  }

  if (response.status === 0) {
    console.error(`Request failed: ${response.error}`);
  }

  sleep(Math.random() * 2 + 1);
}

export function teardown(data) {
  console.log(`Eligibility Engine Load Test Complete`);
  console.log(`Total evaluations completed: ${evaluationCounter.name}`);
}
