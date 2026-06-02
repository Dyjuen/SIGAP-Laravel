import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../modules/auth.js';

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  console.log(`Starting debug test against: ${BASE_URL}`);
  
  // 1. Login
  const auth = login(BASE_URL, { username: 'jurusantik', password: 'tik123' });
  
  // 2. Try to get KAK list to see available IDs
  const kakRes = http.get(`${BASE_URL}/kak`, {
    headers: auth.headers,
    cookies: auth.cookies,
  });
  
  console.log(`KAK Index Status: ${kakRes.status}`);
  // If Inertia, it's hard to parse body without library, but we can check status
  
  // 3. Attempt Store with logging
  const payload = JSON.stringify({
    nama_kegiatan: `Debug Test ${Date.now()}`,
    tipe_kegiatan_id: 1,
    kak_id: 1, 
  });

  const res = http.post(`${BASE_URL}/kegiatan`, payload, {
    headers: auth.headers,
    cookies: auth.cookies,
    redirects: 0, // Don't follow so we can see the exact error/redirect
  });

  console.log(`Store Response Status: ${res.status}`);
  console.log(`Store Response Body: ${res.body.substring(0, 500)}...`);

  check(res, {
    'is redirect or success': (r) => r.status === 302 || r.status === 201 || r.status === 200,
  });
}
