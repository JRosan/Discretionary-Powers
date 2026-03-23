import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp up to 10 users
    { duration: '1m', target: 50 },    // stay at 50 users
    { duration: '30s', target: 100 },  // spike to 100
    { duration: '1m', target: 100 },   // stay at 100
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],     // less than 1% failure rate
  },
};

// Get auth token
function getToken() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'minister@gov.vg',
    password: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });
  return JSON.parse(res.body).token;
}

export function setup() {
  return { token: getToken() };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // GET /api/decisions (list)
  const listRes = http.get(`${BASE_URL}/decisions?limit=20`, { headers });
  check(listRes, { 'decisions list 200': (r) => r.status === 200 });

  // GET /api/decisions/stats
  const statsRes = http.get(`${BASE_URL}/decisions/stats`, { headers });
  check(statsRes, { 'stats 200': (r) => r.status === 200 });

  // GET /api/ministries
  const ministriesRes = http.get(`${BASE_URL}/ministries`);
  check(ministriesRes, { 'ministries 200': (r) => r.status === 200 });

  // GET /api/health
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { 'health 200': (r) => r.status === 200 });

  // Public endpoint
  const publicRes = http.get(`${BASE_URL}/decisions/public?limit=10`);
  check(publicRes, { 'public decisions 200': (r) => r.status === 200 });

  sleep(1);
}
