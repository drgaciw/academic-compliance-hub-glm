import http from "k6/http";
import { check, sleep, SharedArray } from "k6";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";

const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const throughput = new Counter("requests_completed");
const concurrentConnections = new Gauge("concurrent_connections");

const endpoints = new SharedArray("endpoints", function () {
  return JSON.parse(open("./data/api-endpoints.json"));
});

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "5m", target: 50 },
    { duration: "10m", target: 50 },
    { duration: "5m", target: 150 },
    { duration: "10m", target: 150 },
    { duration: "5m", target: 250 },
    { duration: "10m", target: 250 },
    { duration: "5m", target: 50 },
    { duration: "5m", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.01"],
    response_time: ["p(95)<2000", "p(99)<3000"],
    http_req_duration: ["p(95)<2000", "p(99)<3000"],
  },
};

export function setup() {
  console.log(`Starting API Response Time Load Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Endpoints available: ${endpoints.length}`);
}

export default function () {
  const endpoint = endpoints[__VU % endpoints.length];

  const startTimestamp = new Date().getTime();

  const params = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: "10s",
  };

  let response;

  if (endpoint.method === "GET") {
    response = http.get(`${BASE_URL}${endpoint.path}`, params);
  } else if (endpoint.method === "POST") {
    const payload = JSON.stringify(endpoint.body || {});
    response = http.post(`${BASE_URL}${endpoint.path}`, payload, params);
  } else if (endpoint.method === "PUT") {
    const payload = JSON.stringify(endpoint.body || {});
    response = http.put(`${BASE_URL}${endpoint.path}`, payload, params);
  } else if (endpoint.method === "DELETE") {
    response = http.del(`${BASE_URL}${endpoint.path}`, params);
  }

  const duration = new Date().getTime() - startTimestamp;

  const success = check(response, {
    "status is 2xx": () => response.status >= 200 && response.status < 300,
    "response time < 2s": () => duration < 2000,
    "response time < 1s for GET": () => {
      if (endpoint.method === "GET") {
        return duration < 1000;
      }
      return true;
    },
  });

  errorRate.add(!success);
  responseTime.add(duration);
  throughput.add(1);

  if (success) {
    concurrentConnections.add(1);
  }

  if (!success && duration > 2000) {
    console.error(
      `Slow endpoint: ${endpoint.method} ${endpoint.path} - ${duration}ms`,
    );
  }

  if (response.status === 0) {
    console.error(`Request failed: ${response.error}`);
  }

  sleep(Math.random() * 0.5 + 0.5);
}

export function teardown(data) {
  console.log(`API Response Time Load Test Complete`);
  console.log(`Total requests completed: ${throughput.name}`);
}
