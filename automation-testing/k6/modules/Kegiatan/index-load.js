/**
 * ============================================================================
 * SIGAP-Laravel Load Testing — Kegiatan Index/Monitoring Page
 * Tool: k6 (Grafana)
 * ============================================================================
 * 
 * Skenario: 100 virtual users mengakses halaman monitoring kegiatan 
 *           secara bersamaan selama 1 menit
 * 
 * Thresholds:
 *   - p95 response time < 3 detik
 *   - Error rate < 5%
 * 
 * Menjalankan:
 *   k6 run scripts/kegiatan-index-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const pageDuration = new Trend('page_load_duration');

export const options = {
  stages: [
    { duration: '15s', target: 50 },   // Ramp up ke 50
    { duration: '15s', target: 100 },   // Ramp up ke 100
    { duration: '30s', target: 100 },   // Sustain 100 VUs
    { duration: '15s', target: 0 },     // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<3000'],     // 95% under 3s
    'errors': ['rate<0.05'],                  // Error rate under 5%
    'http_req_failed': ['rate<0.05'],
    'page_load_duration': ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// User credentials
const users = [
  { username: 'jurusantik', password: 'tik123' },
  { username: 'jurusansipil', password: 'sipil123' },
  { username: 'ppk', password: 'ppk123' },
  { username: 'wadir2', password: 'wadir2123' },
];

export function setup() {
  // Login once and get session cookies for each user
  const sessions = [];
  
  for (const user of users) {
    const loginPage = http.get(`${BASE_URL}/login`);
    const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const loginRes = http.post(`${BASE_URL}/login`, {
      username: user.username,
      password: user.password,
      _token: csrfToken,
    }, {
      redirects: 5,
    });

    // Capture cookies from jar
    const jar = http.cookieJar();
    const cookies = jar.cookiesForURL(`${BASE_URL}`);
    
    sessions.push({
      username: user.username,
      cookies: cookies,
    });
  }
  
  return { sessions };
}

export default function (data) {
  // Pick a random session
  const session = data.sessions[Math.floor(Math.random() * data.sessions.length)];

  // 1. Access kegiatan monitoring page
  const startTime = Date.now();
  
  const monitoringRes = http.get(`${BASE_URL}/kegiatan/monitoring`, {
    headers: {
      'Accept': 'text/html',
    },
  });

  const duration = Date.now() - startTime;
  pageDuration.add(duration);

  const pageSuccess = check(monitoringRes, {
    'Monitoring page loads (200)': (r) => r.status === 200,
    'Response berisi konten monitoring': (r) => r.body.includes('monitoring') || r.body.includes('Kegiatan') || r.status === 302,
    'Response time < 3s': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!pageSuccess);

  // 2. Simulate search (with debounce)
  if (Math.random() > 0.5) {
    const searchRes = http.get(`${BASE_URL}/kegiatan/monitoring?search=Workshop`, {
      headers: { 'Accept': 'text/html' },
    });

    check(searchRes, {
      'Search response OK': (r) => r.status === 200 || r.status === 302,
      'Search response time < 3s': (r) => r.timings.duration < 3000,
    });
  }

  // 3. Simulate pagination
  if (Math.random() > 0.7) {
    const page2Res = http.get(`${BASE_URL}/kegiatan/monitoring?page=2`, {
      headers: { 'Accept': 'text/html' },
    });

    check(page2Res, {
      'Pagination response OK': (r) => r.status === 200 || r.status === 302,
    });
  }

  // Think time: simulate real user reading page
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}
