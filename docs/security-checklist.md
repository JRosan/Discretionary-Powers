# Security Checklist — DPMS

## OWASP Top 10 Mitigations

### 1. Broken Access Control
- [x] JWT authentication on all protected endpoints
- [x] Role-based authorization policies (5 roles)
- [x] Ministry-scoped access for Ministers and Permanent Secretaries
- [x] Audit trail logs all access

### 2. Cryptographic Failures
- [x] Passwords hashed with bcrypt
- [x] JWT tokens signed with HMAC-SHA256
- [x] Audit chain uses SHA-256 cryptographic hashing
- [ ] TLS 1.3 enforcement (deployment config)
- [ ] Database connection encryption

### 3. Injection
- [x] Parameterized queries via Entity Framework Core
- [x] Input validation with FluentValidation
- [x] No raw SQL construction

### 4. Insecure Design
- [x] 10-step workflow enforced as state machine
- [x] Append-only audit trail
- [x] Principle of least privilege in RBAC

### 5. Security Misconfiguration
- [x] Security headers middleware
- [x] CORS restricted to frontend origin
- [x] Swagger disabled in production
- [x] Default credentials documented as dev-only

### 6. Vulnerable and Outdated Components
- [ ] Automated dependency scanning (Dependabot/Snyk)
- [ ] Regular NuGet/npm audit
- [x] Using current LTS versions (.NET 10, Node 22)

### 7. Identification and Authentication Failures
- [x] JWT with configurable expiry
- [x] Bcrypt password hashing (cost factor 12)
- [x] Rate limiting on auth endpoints (30/min)
- [ ] MFA for elevated roles (future)
- [ ] Account lockout after failed attempts (future)

### 8. Software and Data Integrity Failures
- [x] SHA-256 cryptographic audit chain with tamper detection
- [x] Chain verification endpoint for auditors
- [ ] Signed deployments (CI/CD)

### 9. Security Logging and Monitoring Failures
- [x] Structured request logging
- [x] Audit trail for all state changes
- [x] Exception handling with safe error messages
- [ ] Alerting on suspicious patterns (future)

### 10. Server-Side Request Forgery (SSRF)
- [x] No user-controlled URL fetching
- [x] S3/MinIO accessed via configured endpoint only
- [x] Document uploads validated and sandboxed
