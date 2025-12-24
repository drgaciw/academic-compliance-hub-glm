import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const errorRate = new Rate("errors");
const searchDuration = new Trend("search_duration");
const indexDuration = new Trend("index_duration");
const searchCounter = new Counter("searches_completed");

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

function generateRandomVector(dimensions = 1536) {
  const vector = [];
  for (let i = 0; i < dimensions; i++) {
    vector.push(Math.random() * 2 - 1);
  }
  return vector;
}

export const options = {
  stages: [
    { duration: "2m", target: 25 },
    { duration: "3m", target: 50 },
    { duration: "5m", target: 100 },
    { duration: "5m", target: 100 },
    { duration: "3m", target: 50 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.01"],
    search_duration: ["p(95)<200", "p(99)<300"],
    http_req_duration: ["p(95)<200", "p(99)<300"],
  },
};

export function setup() {
  console.log(`Starting Vector Search Performance Test`);
  console.log(`Base URL: ${BASE_URL}`);

  const payload = {
    batch_size: 10000,
    embedding_dimension: 1536,
  };

  const response = http.post(
    `${BASE_URL}/course-mapping/setup-test-data`,
    JSON.stringify(payload),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  console.log(`Test data setup response: ${response.status}`);

  return { testSetupComplete: response.status === 200 };
}

export default function (data) {
  if (!data.testSetupComplete) {
    console.error("Test data not properly set up");
    return;
  }

  const queryVector = generateRandomVector(1536);

  const startTimestamp = new Date().getTime();

  const params = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  const payload = JSON.stringify({
    query_vector: queryVector,
    limit: 10,
    threshold: 0.7,
  });

  const response = http.post(
    `${BASE_URL}/course-mapping/search`,
    payload,
    params,
  );

  const duration = new Date().getTime() - startTimestamp;

  const success = check(response, {
    "status is 200": () => response.status === 200,
    "has results array": () => {
      try {
        const body = JSON.parse(response.body);
        return Array.isArray(body.results) || Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
    "response time < 200ms": () => duration < 200,
  });

  errorRate.add(!success);
  searchDuration.add(duration);

  if (success) {
    searchCounter.add(1);
  }

  if (duration > 200) {
    console.error(`Slow vector search: ${duration}ms`);
  }

  if (response.status === 0) {
    console.error(`Request failed: ${response.error}`);
  }

  sleep(Math.random() * 0.3 + 0.2);
}

export function teardown(data) {
  console.log(`Vector Search Performance Test Complete`);
  console.log(`Total searches completed: ${searchCounter.name}`);

  const response = http.del(`${BASE_URL}/course-mapping/cleanup-test-data`, {
    headers: { "Content-Type": "application/json" },
  });

  console.log(`Test data cleanup response: ${response.status}`);
}
