# DPMS Administrator Guide

System administration guide for the Discretionary Powers Management System.

---

## Deployment

### Prerequisites

| Component    | Version          | Purpose                        |
| ------------ | ---------------- | ------------------------------ |
| .NET SDK     | 10.0+            | Backend API                    |
| Node.js      | 22 LTS           | Frontend build and runtime     |
| Docker       | 24+              | Container orchestration        |
| PostgreSQL   | 17               | Primary database               |
| MinIO        | Latest           | S3-compatible document storage |
| Redis        | 7                | Caching                        |

### Docker Compose Deployment (Recommended)

Deploy the full stack with a single command:

```bash
# Clone the repository
git clone <repository-url>
cd discretionary-powers

# Start all services (API, frontend, PostgreSQL, MinIO, Redis, Mailpit)
docker compose -f docker/docker-compose.yml up -d
```

This starts:

| Service   | Port  | Description                    |
| --------- | ----- | ------------------------------ |
| Frontend  | 3000  | Next.js application            |
| API       | 5000  | ASP.NET Core backend           |
| PostgreSQL| 5432  | Database                       |
| MinIO     | 9000  | S3-compatible storage          |
| MinIO UI  | 9001  | Storage admin console          |
| Redis     | 6379  | Cache                          |
| Mailpit   | 8025  | Email testing UI (dev only)    |

### Manual Deployment

#### Backend

```bash
cd backend

# Restore and build
dotnet restore
dotnet build --configuration Release

# Apply database migrations
dotnet ef database update --project src/DiscretionaryPowers.Infrastructure \
  --startup-project src/DiscretionaryPowers.Api

# Run the API
dotnet run --project src/DiscretionaryPowers.Api --configuration Release
```

#### Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start the production server
npm start
```

### Environment Variables Reference

#### Backend (appsettings.json or environment)

| Variable                              | Description                        | Default / Example                                    |
| ------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `ConnectionStrings__DefaultConnection`| PostgreSQL connection string       | `Host=localhost;Database=discretionary_powers;Username=postgres;Password=postgres` |
| `Jwt__Key`                            | JWT signing key (min 32 chars)     | `bvi-dpms-secret-key-minimum-32-characters-long!`    |
| `Jwt__Issuer`                         | JWT token issuer                   | `dpms-api`                                           |
| `Jwt__Audience`                       | JWT token audience                 | `dpms-frontend`                                      |
| `S3__Endpoint`                        | S3/MinIO endpoint URL              | `http://localhost:9000`                              |
| `S3__AccessKey`                       | S3 access key                      | `minioadmin`                                         |
| `S3__SecretKey`                       | S3 secret key                      | `minioadmin`                                         |
| `S3__Bucket`                          | S3 bucket name                     | `documents`                                          |
| `S3__Region`                          | S3 region                          | `us-east-1`                                          |
| `Smtp__Host`                          | SMTP server hostname               | `localhost`                                          |
| `Smtp__Port`                          | SMTP server port                   | `1025`                                               |
| `Smtp__From`                          | Sender email address               | `noreply@gov.vg`                                     |
| `Frontend__Url`                       | Frontend URL for CORS              | `http://localhost:3000`                              |

#### Frontend (.env)

| Variable             | Description              | Default                        |
| -------------------- | ------------------------ | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | Backend API base URL     | `http://localhost:5000/api`    |

---

## Database

### Schema Overview

The database consists of 9 tables:

| Table             | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `users`           | System users with roles and ministry assignments     |
| `ministries`      | Government ministries                                |
| `decisions`       | Discretionary power decisions                        |
| `decision_steps`  | Individual steps within the 10-step workflow         |
| `documents`       | Uploaded documents linked to decisions               |
| `comments`        | Internal and public comments on decisions            |
| `notifications`   | User notifications                                   |
| `audit_entries`   | Cryptographically chained audit trail                |
| `judicial_reviews`| Judicial review records for challenged decisions     |

### Database Migrations

#### EF Core Migrations (Recommended)

EF Core migrations are the primary mechanism for managing schema changes.

```bash
cd backend

# Install the EF Core CLI tool (if not already installed)
dotnet tool install --global dotnet-ef

# Create a new migration
dotnet ef migrations add <MigrationName> \
  --project src/DiscretionaryPowers.Infrastructure \
  --startup-project src/DiscretionaryPowers.Api

# Apply pending migrations
dotnet ef database update \
  --project src/DiscretionaryPowers.Infrastructure \
  --startup-project src/DiscretionaryPowers.Api

# Revert the last migration
dotnet ef migrations remove \
  --project src/DiscretionaryPowers.Infrastructure \
  --startup-project src/DiscretionaryPowers.Api
```

#### Auto-Migration in Development

In development, the API automatically applies pending migrations and seeds data on startup. This is controlled by settings in `appsettings.Development.json`:

```json
{
  "Database": {
    "AutoMigrate": true,
    "Seed": true
  }
}
```

In production, `AutoMigrate` is `false` by default. Migrations should be applied manually before deploying a new version to avoid unexpected schema changes during startup.

#### Manual SQL Migration (Fallback)

For environments where EF Core migrations are not available (e.g., DBA-managed databases), a manual SQL script is provided:

```bash
# Apply the initial schema
psql -h localhost -U postgres -d discretionary_powers \
  -f backend/migrations/001_initial_schema.sql
```

The SQL scripts are located in `backend/migrations/` and create the complete schema including all PostgreSQL enum types, tables, indexes, and constraints.

#### Creating New Migrations

When modifying entity classes or configurations:

1. Make changes to the entity classes in `DiscretionaryPowers.Domain`
2. Update EF configurations in `DiscretionaryPowers.Infrastructure/Data/Configurations/` if needed
3. Generate the migration:
   ```bash
   dotnet ef migrations add DescriptiveMigrationName \
     --project src/DiscretionaryPowers.Infrastructure \
     --startup-project src/DiscretionaryPowers.Api
   ```
4. Review the generated migration in `Infrastructure/Migrations/`
5. Apply and test locally before committing

### Seeding Initial Data

The application seeds initial data (demo users, ministries) on first startup when the database is empty. Seeding is controlled by the `Database:Seed` configuration setting. To re-seed:

1. Drop the database: `dotnet ef database drop --force`
2. Re-apply migrations: `dotnet ef database update`
3. Restart the API to trigger seeding

### Backup Procedures

#### Manual Backup

```bash
# Full database backup
pg_dump -h localhost -U postgres -d discretionary_powers \
  -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Restore from backup
pg_restore -h localhost -U postgres -d discretionary_powers \
  --clean --if-exists backup_20260322_120000.dump
```

#### Scheduled Backups

Set up a cron job for automated daily backups:

```bash
# Add to crontab (crontab -e)
0 2 * * * pg_dump -h localhost -U postgres -d discretionary_powers \
  -F c -f /backups/dpms_$(date +\%Y\%m\%d).dump 2>&1 | logger -t dpms-backup
```

#### Point-in-Time Recovery

For point-in-time recovery, enable WAL archiving in `postgresql.conf`:

```
wal_level = replica
archive_mode = on
archive_command = 'cp %p /wal_archive/%f'
```

Then restore to a specific point:

```bash
pg_restore --target-time="2026-03-22 14:00:00" ...
```

---

## Monitoring

### Health Check

The API exposes a health check endpoint:

```
GET /api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-22T12:00:00Z"
}
```

Use this endpoint for load balancer health checks and uptime monitoring.

### Request Logging

The API logs all requests with details including:

- Request method and path
- Response status code
- Request duration
- User identity (when authenticated)

Logs are written to stdout in structured format, suitable for collection by log aggregators.

### Audit Trail Verification

Verify the integrity of the cryptographic audit chain:

```
POST /api/audit/verify-chain
Authorization: Bearer <token>
```

Response:

```json
{
  "valid": true,
  "checkedCount": 1523,
  "firstInvalidId": null
}
```

If `valid` is `false`, the `firstInvalidId` indicates where the chain was broken, which may indicate data tampering.

### Recommended Monitoring Stack

- **Prometheus** -- metrics collection from the API
- **Grafana** -- dashboards and alerting
- **Loki** -- log aggregation

Key metrics to monitor:

- API response times (p50, p95, p99)
- Error rate (5xx responses)
- Database connection pool usage
- S3/MinIO storage usage
- Active user sessions

---

## Security

### JWT Token Configuration

Tokens are configured via environment variables:

- `Jwt__Key` -- signing key, must be at least 32 characters. Use a cryptographically random value in production.
- `Jwt__Issuer` -- identifies the token issuer
- `Jwt__Audience` -- identifies the intended recipient

Rotate the signing key by updating the environment variable and restarting the API. Existing tokens will be invalidated.

### CORS Configuration

CORS is configured via the `Frontend__Url` environment variable. Only the specified origin is allowed to make cross-origin requests to the API.

For production, set this to the exact frontend URL (e.g., `https://dpms.gov.vg`).

### Rate Limiting

The API applies rate limiting to prevent abuse. Configure limits in `appsettings.json` or via environment variables.

### Security Headers

The API includes security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (when HTTPS is enabled)

### SSL/TLS Setup

For production, terminate TLS at the reverse proxy level:

1. Obtain an SSL certificate (e.g., via Let's Encrypt)
2. Configure your reverse proxy (nginx, Caddy, etc.) to handle HTTPS
3. Proxy requests to the API on port 5000 and frontend on port 3000
4. Set `ASPNETCORE_URLS=http://+:8080` (backend listens on HTTP behind the proxy)

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name dpms.gov.vg;

    ssl_certificate     /etc/ssl/certs/dpms.gov.vg.pem;
    ssl_certificate_key /etc/ssl/private/dpms.gov.vg.key;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Checklist

See [security-checklist.md](security-checklist.md) for a comprehensive pre-deployment security review.

---

## Troubleshooting

### Common Issues

#### API fails to start

- **Check the connection string**: Ensure PostgreSQL is running and the `ConnectionStrings__DefaultConnection` is correct
- **Check port availability**: Ensure port 5000 is not already in use
- **Check .NET SDK version**: The API requires .NET 10 or later

#### Frontend fails to build

- **Check Node.js version**: Requires Node.js 22+
- **Clear cache**: Delete `node_modules` and `.next`, then run `npm install && npm run build`
- **Check API URL**: Ensure `NEXT_PUBLIC_API_URL` points to the running API

#### Database connection issues

- **Verify PostgreSQL is running**: `pg_isready -h localhost -p 5432`
- **Check credentials**: Verify username and password in the connection string
- **Check network**: Ensure the API host can reach the database host
- **Check max connections**: Default PostgreSQL limit is 100 connections

#### S3/MinIO connectivity

- **Verify MinIO is running**: Check `http://localhost:9001` for the console
- **Check credentials**: Ensure `S3__AccessKey` and `S3__SecretKey` match MinIO configuration
- **Check bucket exists**: The `documents` bucket must exist in MinIO
- **Check endpoint URL**: Ensure `S3__Endpoint` is reachable from the API

#### Emails not being sent

- **Check SMTP configuration**: Verify `Smtp__Host` and `Smtp__Port`
- **Development**: Use Mailpit at `http://localhost:8025` to view captured emails
- **Production**: Ensure SMTP server accepts connections from the API host

### Log Locations

| Component  | Log Location                              |
| ---------- | ----------------------------------------- |
| API        | stdout (containerised) or `logs/` folder  |
| Frontend   | stdout / browser console                  |
| PostgreSQL | Docker logs or `/var/log/postgresql/`     |
| MinIO      | Docker logs                               |

To view Docker container logs:

```bash
# View API logs
docker compose -f docker/docker-compose.yml logs -f api

# View all service logs
docker compose -f docker/docker-compose.yml logs -f
```
