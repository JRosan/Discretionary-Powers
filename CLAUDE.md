# CLAUDE.md — GovDecision SaaS Platform (formerly BVI DPMS)

## Project Overview

Multi-tenant SaaS platform for managing discretionary powers and administrative decisions.
Originally built for the Government of the British Virgin Islands, now architected as a
white-label SaaS serving any government jurisdiction worldwide.

## Architecture

**Multi-tenant SaaS** with separated frontend and backend:

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, React Query, Radix UI
- **Backend**: ASP.NET Core (.NET 10) Web API, Entity Framework Core, PostgreSQL 17
- **Multi-tenancy**: Organization-scoped data with EF Core global query filters
- **Storage**: MinIO (S3-compatible) for document uploads (tenant-isolated)
- **Email**: MailKit/Microsoft Graph with branded templates
- **Auth**: JWT tokens with role-based + organization-scoped authorization

## Directory Structure

```
├── backend/                     # C#/.NET backend
│   ├── src/
│   │   ├── DiscretionaryPowers.Domain/        # Entities, enums, interfaces, workflow
│   │   ├── DiscretionaryPowers.Application/   # DTOs, services, validators
│   │   ├── DiscretionaryPowers.Infrastructure/# EF Core, S3, email, crypto, tenant
│   │   └── DiscretionaryPowers.Api/           # Controllers, auth, middleware
│   ├── migrations/              # SQL migration scripts
│   └── DiscretionaryPowers.sln
├── src/                         # Next.js frontend
│   ├── app/                     # Pages (App Router)
│   │   ├── (staff)/             # Staff portal (auth required)
│   │   ├── portal/              # Public transparency portal
│   │   ├── login/               # Auth pages
│   │   └── ...
│   ├── components/              # React components
│   ├── lib/                     # API client, auth, tenant, i18n
│   └── modules/                 # Client-side business logic
├── docker/                      # Docker Compose files
├── azure/                       # Azure deployment (Bicep IaC)
├── tests/                       # Unit, E2E, load tests
└── docs/                        # Documentation
```

## Key Domain Concepts

- **Organization**: Tenant entity — each government jurisdiction is an organization
- **Decision**: A discretionary power exercise tracked through a configurable workflow
- **Workflow Template**: Per-org configurable step framework (default: 10 steps)
- **Audit Trail**: Append-only, SHA-256 cryptographically chained entries (per-org isolation)
- **5 Default Roles**: Minister, Permanent Secretary, Legal Advisor, Auditor, Public

## Multi-Tenancy

- Every table has `organization_id` column with FK to `organizations`
- EF Core global query filters automatically scope all queries to current tenant
- `TenantResolutionMiddleware` reads org from JWT `organization_id` claim
- `ITenantService` provides current tenant context to all services
- Null tenant ID = super-admin bypass (no filtering)

## Development

### Prerequisites
- .NET 10 SDK
- Node.js 22 LTS
- Docker & Docker Compose

### Quick Start
```bash
docker compose -f docker/docker-compose.dev.yml up -d
cd backend && dotnet run --project src/DiscretionaryPowers.Api
# In separate terminal:
npm install && npm run dev
```

### Environment Variables

**Frontend** (.env):
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: http://localhost:5000/api)

**Backend** (appsettings.json or environment):
- `ConnectionStrings__DefaultConnection` — PostgreSQL connection string
- `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` — JWT configuration
- `S3__Endpoint`, `S3__AccessKey`, `S3__SecretKey`, `S3__Bucket` — S3/MinIO
- `Smtp__Host`, `Smtp__Port`, `Smtp__From` — Email (SMTP fallback)
- `MsGraph__TenantId`, `MsGraph__ClientId`, `MsGraph__ClientSecret` — Microsoft Graph email
- `Frontend__Url` — CORS origin

## API Conventions

- REST API at `/api/*` with JSON request/response bodies
- JWT Bearer authentication with organization_id claim
- Role-based + tenant-scoped authorization
- Pagination: `?limit=20&offset=0` or cursor-based
- Errors: RFC 7807 Problem Details format
- OpenAPI/Swagger documentation at `/swagger`

## Testing

### Backend
```bash
cd backend && dotnet test                    # Run all xUnit tests
```

### Frontend
```bash
npm test                                     # Run Vitest unit tests
npm run test:e2e                             # Run Playwright E2E tests
npm run test:load                            # Run k6 load tests
```

## Phase Completion Status

- **Phase 1**: Core backend API — Complete
- **Phase 2**: Frontend application — Complete
- **Phase 3**: Advanced features (notifications, search, export, PWA) — Complete
- **Phase 4**: Quality assurance (tests, security, documentation) — Complete
- **Phase 5**: Launch readiness (E2E tests, performance, i18n, CI/CD) — Complete
- **Phase 6**: SaaS transformation (multi-tenancy, configurable workflows, white-label) — Complete
- **Phase 7**: Platform operations (super-admin, billing, API keys, security monitoring) — Complete

## Platform Owner (Super Admin)

Login: `superadmin@govdecision.com` / `password`

Pages:
- `/super-admin/dashboard` — Platform metrics (tenants, users, MRR/ARR)
- `/super-admin/tenants` — Tenant CRUD, provisioning, detail with stats
- `/super-admin/revenue` — Revenue dashboard, payment history, plan breakdown
- `/super-admin/security` — Login activity log (success/failed/MFA events)
- `/super-admin/sessions` — Active sessions (24h window)
- `/super-admin/compliance` — GDPR data export/deletion, compliance checklist
- `/super-admin/health` — System health (DB, storage, email, payments, metrics)
- `/super-admin/announcements` — Platform-wide banners (info/warning/maintenance)
- `/super-admin/audit` — Cross-tenant audit log with filters
- `/super-admin/settings` — Platform configuration (read-only)

## Subscription Tiers

| Plan | Annual | Users | Storage | Key Features |
|------|--------|-------|---------|-------------|
| Starter | $40,000 | 50 | 5GB | Core workflow, audit trail, basic reports |
| Professional | $85,000 | 200 | 25GB | Custom workflows, API keys, MFA, redaction |
| Enterprise | $200,000 | Unlimited | 100GB | All features, custom branding, SLA |

Feature gating enforced by `SubscriptionGuardService` on every API call.

## Database Tables (18)

organizations, ministries, users, decisions, decision_steps, documents,
audit_entries, judicial_reviews, notifications, comments, system_settings,
workflow_templates, workflow_step_templates, decision_type_configs,
api_keys, subscriptions, payment_records, login_events, platform_announcements

## Documentation

- [User Guide](docs/user-guide.md) — Guide for government staff
- [Admin Guide](docs/admin-guide.md) — Deployment, database, monitoring, security
- [API Reference](docs/api-reference.md) — Complete REST API documentation
- [Security Checklist](docs/security-checklist.md) — Pre-deployment security review
- [Azure Deployment](docs/deployment-azure.md) — Azure deployment guide

## Design System

White-label with per-tenant customization:
- Default: Primary #1D3557, Accent #2A9D8F, Error #E76F51, Warning #E9C46A
- Font: Inter (body), JetBrains Mono (reference numbers)
- Components: Radix UI primitives styled with Tailwind CSS
- WCAG 2.2 AA compliant
