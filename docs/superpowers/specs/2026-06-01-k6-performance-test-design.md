# Design Spec: Performance Testing with k6

## 1. Overview
Implementing load and performance testing for SIGAP-Laravel using **k6**. The focus is on critical user flows to ensure the system can handle concurrent traffic according to project requirements.

## 2. Goals
- Simulate concurrent user activity on the Login and Dashboard.
- Verify system stability under load (50 concurrent users).
- Document performance metrics (latency, throughput, error rates).

## 3. Scenarios

### 3.1 Login & Dashboard Load Test
- **Script**: `automation-testing/k6/scripts/login-load.js`
- **Flow**:
  1. GET `/login` to fetch CSRF token.
  2. POST `/login` with random credentials from `UserSeeder`.
  3. Verify redirect to `/dashboard`.
  4. Sleep 1-3 seconds (simulating human behavior).
- **Load Profile**:
  - Ramp-up: 0 to 50 Virtual Users (VUs) in 10s.
  - Sustain: 50 VUs for 20s.
  - Ramp-down: 50 to 0 VUs in 10s.

### 3.2 Kegiatan Monitoring Index (Read-Only)
- **Script**: `automation-testing/k6/scripts/kegiatan-index-load.js`
- **Flow**:
  1. Login as authorized user.
  2. GET `/kegiatan/monitoring`.
  3. Verify status 200.

## 4. Performance Thresholds
- `http_req_duration`: p(95) < 2000ms (95% of requests under 2 seconds).
- `errors` (Rate): < 5%.
- `http_req_failed`: < 5%.

## 5. Technical Implementation
- **Tool**: k6 (Installed via `winget`).
- **Runner**: `automation-testing/k6/run-k6.bat` (Updated to point to `scripts/`).
- **Data Source**: Hardcoded test accounts in scripts (aligned with `UserSeeder`).

## 6. Reporting
- Results output to `automation-testing/reports/k6/` in JSON format.
- Summary display in terminal.

## 7. Success Criteria
1. k6 is successfully installed and accessible in the CLI.
2. Scripts are correctly located in `automation-testing/k6/scripts/`.
3. `run-k6.bat` executes the tests without technical errors.
4. Performance reports are generated.
