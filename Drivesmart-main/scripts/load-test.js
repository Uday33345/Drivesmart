import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'], // < 5% errors allowed
    http_req_duration: ['p(95)<1500'], // 95% of requests under 1.5s
  },
};

export default function () {
  const url = __ENV.BACKEND_URL || 'http://localhost:5173';
  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  sleep(0.5);
}
