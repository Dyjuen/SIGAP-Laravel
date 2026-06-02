import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../modules/auth.js';

export const options = {
  stages: [
    { duration: '15s', target: 30 }, // Ramp up to 30 users
    { duration: '30s', target: 30 }, // Sustain
    { duration: '15s', target: 0 },  // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Integrated flows take more time
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  // 1. Login
  const auth = login(BASE_URL, { username: 'jurusantik', password: 'tik123' });

  // 2. Discover ID from Monitoring (Auto-Discovery)
  const indexRes = http.get(`${BASE_URL}/kegiatan/monitoring`, {
    headers: auth.headers,
    cookies: auth.cookies,
  });

  // Extract ID using regex from Inertia JSON body
  const match = indexRes.body.match(/"kegiatan_id":(\d+)/);
  const kegiatanId = match ? match[1] : null;

  if (kegiatanId) {
    // 3. View Detail
    const showRes = http.get(`${BASE_URL}/kegiatan/${kegiatanId}`, {
      headers: auth.headers,
      cookies: auth.cookies,
    });
    check(showRes, { 'view detail ok': (r) => r.status === 200 });

    // 4. Random Action: PDF Generation (CPU intensive)
    // Only 20% of users do this to simulate realistic load
    if (Math.random() < 0.2) {
      const pdfRes = http.get(`${BASE_URL}/kak/${kegiatanId}/pdf/preview`, {
         headers: auth.headers,
         cookies: auth.cookies,
      });
      check(pdfRes, { 'pdf generated': (r) => r.status === 200 });
    }
  }

  // Simulate user reading time
  sleep(Math.random() * 3 + 2); 
}
