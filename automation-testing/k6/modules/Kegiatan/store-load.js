/**
 * ============================================================================
 * SIGAP-Laravel Load Testing — Kegiatan Store (Submit) Endpoint
 * Tool: k6 (Grafana)
 * ============================================================================
 * 
 * Skenario: 20 virtual users submit kegiatan secara bersamaan selama 30 detik
 *           Menguji kemampuan transaction handling dan concurrent writes
 * 
 * Thresholds:
 *   - p95 response time < 5 detik
 *   - Error rate < 10% (write operations can be slower)
 * 
 * CATATAN: Test ini akan menghasilkan validation errors karena
 *          setiap KAK hanya bisa punya satu Kegiatan. 
 *          Yang diukur adalah response time dan stability, bukan success rate.
 * 
 * Menjalankan:
 *   k6 run scripts/kegiatan-store-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const storeDuration = new Trend('store_duration');

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Ramp up
    { duration: '20s', target: 20 },   // Sustain 20 VUs
    { duration: '10s', target: 0 },    // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<5000'],     // 95% under 5s
    'errors': ['rate<0.10'],                  // 10% error tolerance for writes
    'http_req_failed': ['rate<0.10'],
    'store_duration': ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  // 1. Login as Pengusul
  const loginPage = http.get(`${BASE_URL}/login`);
  const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';

  if (!csrfToken) {
    errorRate.add(1);
    return;
  }

  const loginRes = http.post(`${BASE_URL}/login`, {
    username: 'jurusantik',
    password: 'tik123',
    _token: csrfToken,
  }, {
    redirects: 5,
  });

  // 2. Get fresh CSRF token after login (from dashboard or kegiatan page)
  const kegiatanPage = http.get(`${BASE_URL}/kegiatan`);
  const freshCsrfMatch = kegiatanPage.body.match(/name="_token"\s+value="([^"]+)"/);
  const freshCsrf = freshCsrfMatch ? freshCsrfMatch[1] : csrfToken;

  // 3. Attempt to store kegiatan
  //    This will likely return 422 (validation) or 302 (redirect) 
  //    since test data may not be valid. We're measuring performance, not success.
  const startTime = Date.now();

  const storePayload = {
    kak_id: String(Math.floor(Math.random() * 10) + 1),
    penanggung_jawab_manual: `Load Test User ${__VU}-${__ITER}`,
    pelaksana_manual: `Load Test Pelaksana ${__VU}-${__ITER}`,
    _token: freshCsrf,
  };

  const storeRes = http.post(`${BASE_URL}/kegiatan`, storePayload, {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    redirects: 0, // Don't follow redirects to measure raw response time
  });

  const duration = Date.now() - startTime;
  storeDuration.add(duration);

  // 4. Verify the server responded (any response = server is handling load)
  const storeCheck = check(storeRes, {
    'Server merespons (bukan timeout)': (r) => r.status !== 0,
    'Response time < 5s': (r) => r.timings.duration < 5000,
    'Response valid (200/302/422)': (r) => [200, 302, 422, 403].includes(r.status),
    'Tidak ada server error (5xx)': (r) => r.status < 500,
  });

  errorRate.add(!storeCheck);

  // Think time
  sleep(Math.random() * 2 + 1);
}
