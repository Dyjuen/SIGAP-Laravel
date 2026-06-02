import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 20 },
    { duration: "20s", target: 20 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    "http_req_duration": ["p(95)<2000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

export default function () {
  const res = http.get(`${BASE_URL}/kegiatan/monitoring`);
  
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
  
  sleep(1);
}

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
  return {
    "automation-testing/reports/k6/kegiatan-index-report.html": htmlReport(data),
    "stdout": textSummary(data, { indent: " ", enableColors: true }),
  };
}