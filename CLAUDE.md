# CLAUDE.md — Discretionary Powers Management System

## Project Overview

Government of the British Virgin Islands — Discretionary Powers Management System (DPMS).
Digitises the BVI's 10-step framework for the proper and lawful exercise of discretionary powers,
following the 2022 Commission of Inquiry governance reforms.

## Architecture

**Modular monolith** with separated frontend and backend:

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, React Query, Radix UI
- **Backend**: ASP.NET Core (.NET 10) Web API, Entity Framework Core, PostgreSQL 17
- **Storage**: MinIO (S3-compatible) for document uploads
- **Email**: MailKit via SMTP (Mailpit for dev)
- **Auth**: JWT tokens with role-based authorization policies

## Directory Structure

```
├── backend/                     # C#/.NET backend
│   ├── src/
│   │   ├── DiscretionaryPowers.Domain/        # Entities, enums, interfaces, workflow machine
│   │   ├── DiscretionaryPowers.Application/   # DTOs, services, validators
│   │   ├── DiscretionaryPowers.Infrastructure/# EF Core, S3, email, crypto
│   │   └── DiscretionaryPowers.Api/           # Controllers, auth, middleware
│   └── DiscretionaryPowers.sln
├── src/                         # Next.js frontend
│   ├── app/                     # Pages (App Router)
│   │   ├── (staff)/             # Staff portal (auth required)
│   │   └── (public)/            # Public transparency portal
│   ├── components/              # React components (ui/, layout/, decisions/, documents/)
│   ├── lib/                     # Utilities (api.ts, constants.ts, utils.ts)
│   └── modules/                 # Client-side business logic
├── docker/                      # Docker Compose files
└── public/                      # Static assets
```

## Key Domain Concepts

- **Decision**: A discretionary power exercise tracked through a 10-step workflow
- **10-Step Framework**: Confirm Authority → Follow Procedures → Gather Info → Evaluate Evidence → Standard of Proof → Fairness → Procedural Fairness → Consider Merits → Communicate → Record
- **Audit Trail**: Append-only, SHA-256 cryptographically chained entries for tamper detection
- **5 Roles**: Minister, Permanent Secretary, Legal Advisor, Auditor, Public

## Development

### Prerequisites
- .NET 10 SDK
- Node.js 22 LTS
- Docker & Docker Compose

### Quick Start
```bash
# Start infrastructure
docker compose -f docker/docker-compose.dev.yml up -d

# Backend
cd backend && dotnet run --project src/DiscretionaryPowers.Api

# Frontend (separate terminal)
npm install && npm run dev
```

### Environment Variables

**Frontend** (.env):
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: http://localhost:5000/api)

**Backend** (appsettings.json or environment):
- `ConnectionStrings__DefaultConnection` — PostgreSQL connection string
- `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` — JWT configuration
- `S3__Endpoint`, `S3__AccessKey`, `S3__SecretKey`, `S3__Bucket` — S3/MinIO
- `Smtp__Host`, `Smtp__Port`, `Smtp__From` — Email
- `Frontend__Url` — CORS origin

## API Conventions

- REST API at `/api/*` with JSON request/response bodies
- JWT Bearer authentication
- Role-based authorization via ASP.NET policies
- Pagination: `?limit=20&offset=0` or cursor-based
- Errors: RFC 7807 Problem Details format
- OpenAPI/Swagger documentation at `/swagger`

## Testing

- **Backend**: `dotnet test` (xUnit)
- **Frontend**: `npm test` (Vitest), `npm run test:e2e` (Playwright)

## Design System

GOV.BVI — minimalist, professional, WCAG 2.2 AA compliant:
- Font: Inter (body), JetBrains Mono (reference numbers)
- Primary: #1D3557, Accent: #2A9D8F, Error: #E76F51, Warning: #E9C46A
- Components: Radix UI primitives styled with Tailwind CSS
