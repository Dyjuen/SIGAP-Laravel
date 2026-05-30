/**
 * ============================================================================
 * SIGAP-Laravel Load Testing — Login Endpoint
 * Tool: k6 (Grafana)
 * ============================================================================
 * 
 * Skenario: 50 virtual users melakukan login secara bersamaan selama 30 detik
 * 
 * Thresholds:
 *   - p95 response time < 2 detik
 *   - Error rate < 5%
 *   - Minimum 95% requests berhasil
 * 
 * Menjalankan:
 *   k6 run scripts/login-load.js
 *   k6 run --out json=../reports/k6/login-load.json scripts/login-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');

// Test configuration
export const options = {
  // Ramp up to 50 VUs over 10s, hold for 20s, ramp down over 10s
  stages: [
    { duration: '10s', target: 50 },  // Ramp up
    { duration: '20s', target: 50 },  // Sustain
    { duration: '10s', target: 0 },   // Ramp down
  ],
  
  // Performance thresholds
  thresholds: {
    'http_req_duration': ['p(95)<2000'],    // 95% requests under 2s
    'errors': ['rate<0.05'],                 // Error rate under 5%
    'http_req_failed': ['rate<0.05'],        // HTTP failure rate under 5%
    'login_duration': ['p(95)<2000'],        // Login-specific p95 under 2s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Daftar user untuk load test (dari UserSeeder.php)
const users = [
  { username: 'jurusantik', password: 'tik123' },
  { username: 'jurusansipil', password: 'sipil123' },
  { username: 'jurusanmesin', password: 'mesin123' },
  { username: 'jurusantgp', password: 'tgp123' },
  { username: 'jurusanak', password: 'ak123' },
  { username: 'ppk', password: 'ppk123' },
  { username: 'wadir2', password: 'wadir2123' },
  { username: 'bendahara', password: 'bendahara123' },
];

export default function () {
  // 1. Pick random user
  const user = users[Math.floor(Math.random() * users.length)];

  // 2. GET login page to retrieve CSRF token
  const loginPage = http.get(`${BASE_URL}/login`);
  
  const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';

  if (!csrfToken) {
    errorRate.add(1);
    console.error('Failed to extract CSRF token');
    return;
  }

  // 3. POST login
  const startTime = Date.now();
  
  const loginRes = http.post(`${BASE_URL}/login`, {
    username: user.username,
    password: user.password,
    _token: csrfToken,
  }, {
    redirects: 5,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const duration = Date.now() - startTime;
  loginDuration.add(duration);

  // 4. Verify login was successful
  const loginSuccess = check(loginRes, {
    'Login berhasil (status 200 atau redirect)': (r) => r.status === 200 || r.status === 302,
    'Redirect ke dashboard': (r) => r.url.includes('/dashboard') || r.status === 302,
    'Response time < 2s': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!loginSuccess);

  // 5. Brief pause between iterations (simulating real user behavior)
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// k6 built-in text summary
function textSummary(data, opts) {
  // k6 provides this automatically, this is a fallback
  return JSON.stringify(data, null, 2);
}
