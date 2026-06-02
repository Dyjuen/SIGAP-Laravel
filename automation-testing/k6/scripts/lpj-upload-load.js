import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from '../modules/auth.js';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 5 },
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const binFile = open('../modules/sample.pdf', 'b');

export default function () {
  const auth = login(BASE_URL, { username: 'jurusantik', password: 'tik123' });

  const data = {
    file_lpj: http.file(binFile, 'test_lpj.pdf', 'application/pdf'),
    keterangan: 'Load test upload LPJ',
  };

  // Route based on web.php: kegiatan/{kegiatan}/lpj/submit
  const res = http.post(`${BASE_URL}/kegiatan/1/lpj/submit`, data, {
    headers: {
       'X-XSRF-TOKEN': auth.headers['X-XSRF-TOKEN'],
       'X-Requested-With': 'XMLHttpRequest',
    },
    cookies: auth.cookies,
  });

  check(res, {
    'upload success': (r) => r.status === 200 || r.status === 302,
  });

  sleep(2);
}
