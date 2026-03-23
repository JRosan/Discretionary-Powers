# Load Testing with k6

## Prerequisites

Install k6:

**Windows (winget)**:
```bash
winget install k6 --source winget
```

**Windows (Chocolatey)**:
```bash
choco install k6
```

**macOS (Homebrew)**:
```bash
brew install k6
```

**Linux (Debian/Ubuntu)**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Docker**:
```bash
docker run --rm -i grafana/k6 run - <tests/load/k6-test.js
```

## Running the Load Test

Make sure the backend API is running locally (default: `http://localhost:5000/api`).

```bash
# Using npm script
npm run test:load

# Or directly with k6
k6 run tests/load/k6-test.js

# With a custom API URL
k6 run -e API_URL=http://your-api-host/api tests/load/k6-test.js
```

## Test Stages

| Stage    | Duration | Virtual Users | Purpose          |
|----------|----------|---------------|------------------|
| Ramp-up  | 30s      | 0 → 10        | Warm up          |
| Steady   | 1m       | 50            | Normal load      |
| Spike    | 30s      | 50 → 100      | Stress test      |
| Hold     | 1m       | 100           | Sustained stress |
| Ramp-down| 30s      | 100 → 0       | Cool down        |

## Thresholds

- **p95 response time**: < 500ms
- **Error rate**: < 1%

## Endpoints Tested

- `GET /api/decisions?limit=20` (authenticated)
- `GET /api/decisions/stats` (authenticated)
- `GET /api/ministries` (public)
- `GET /api/health` (public)
- `GET /api/decisions/public?limit=10` (public)
