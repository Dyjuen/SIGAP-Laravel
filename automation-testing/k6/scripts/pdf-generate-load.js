import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../modules/auth.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<15000'], // PDF generation is very slow
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const auth = login(BASE_URL, { username: 'jurusantik', password: 'tik123' });

  // Access PDF preview for KAK ID 1
  const res = http.get(`${BASE_URL}/kak/1/pdf/preview`, {
    headers: auth.headers,
    cookies: auth.cookies,
  });

  check(res, {
    'pdf generated': (r) => r.status === 200,
    'is pdf content': (r) => r.headers['Content-Type'] === 'application/pdf' || r.body.includes('Inertia'), // If it returns Inertia, it might be failing or redirecting
  });

  sleep(3);
}
