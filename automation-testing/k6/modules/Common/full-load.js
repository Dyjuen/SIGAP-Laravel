import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  // 1. Visit Landing Page
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'landing page status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 2. Perform Login (Simulated)
  // Note: For real load tests, we'd use a pool of unique users to avoid session conflicts
  res = http.post(`${BASE_URL}/login`, {
    username: 'admin',
    password: 'password',
  });
  check(res, {
    'login status is 200 or 302': (r) => r.status === 200 || r.status === 302,
  });
  sleep(2);

  // 3. Visit Dashboard
  res = http.get(`${BASE_URL}/dashboard`);
  check(res, {
    'dashboard status is 200': (r) => r.status === 200,
  });
  sleep(3);
}
