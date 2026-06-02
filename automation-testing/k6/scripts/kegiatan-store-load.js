import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../modules/auth.js';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const auth = login(BASE_URL, { username: 'jurusantik', password: 'tik123' });

  const payload = JSON.stringify({
    nama_kegiatan: `Load Test Kegiatan ${Math.random()}`,
    tipe_kegiatan_id: 1,
    kak_id: 1, // Assumes KAK with ID 1 exists
  });

  const res = http.post(`${BASE_URL}/kegiatan`, payload, {
    headers: auth.headers,
    cookies: auth.cookies,
  });

  check(res, {
    'create success 201/302': (r) => r.status === 201 || r.status === 302 || r.status === 200,
  });

  sleep(1);
}
