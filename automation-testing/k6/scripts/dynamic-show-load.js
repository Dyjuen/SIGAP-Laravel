import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../modules/auth.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 10 },
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const auth = login(BASE_URL, { username: 'jurusantik', password: 'tik123' });

  // 1. Ambil data dari dashboard/index untuk cari ID yang valid secara acak
  // Karena ini Inertia, kita asumsikan ada data di response atau kita hit API search jika ada
  const indexRes = http.get(`${BASE_URL}/kegiatan/monitoring`, {
    headers: auth.headers,
    cookies: auth.cookies,
  });

  // Regex sederhana untuk mencari ID kegiatan dari HTML/JSON Inertia
  // Mencari pola "kegiatan_id":123
  const match = indexRes.body.match(/"kegiatan_id":(\d+)/);
  const kegiatanId = match ? match[1] : null;

  if (!kegiatanId) {
    console.warn('No Kegiatan ID found in index, skipping iteration');
    return;
  }

  // 2. Jalankan test pada ID yang ditemukan
  const res = http.get(`${BASE_URL}/kegiatan/${kegiatanId}`, {
    headers: auth.headers,
    cookies: auth.cookies,
  });

  check(res, {
    'show kegiatan success': (r) => r.status === 200,
  });

  sleep(1);
}
