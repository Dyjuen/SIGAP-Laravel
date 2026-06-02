import http from 'k6/http';
import { check } from 'k6';

export function login(baseUrl, user) {
  // 1. Get CSRF from login page
  const res = http.get(`${baseUrl}/login`);
  const xsrfToken = res.cookies['XSRF-TOKEN'] ? decodeURIComponent(res.cookies['XSRF-TOKEN'][0].value) : '';

  // 2. Post login
  const loginRes = http.post(`${baseUrl}/login`, JSON.stringify({
    username: user.username,
    password: user.password,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': xsrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  check(loginRes, {
    'logged in': (r) => r.status === 200 || r.status === 302,
  });

  // Extract new CSRF for subsequent POSTs
  const newXsrfToken = loginRes.cookies['XSRF-TOKEN'] ? decodeURIComponent(loginRes.cookies['XSRF-TOKEN'][0].value) : xsrfToken;

  return {
    headers: {
      'X-XSRF-TOKEN': newXsrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
    cookies: loginRes.cookies,
  };
}
