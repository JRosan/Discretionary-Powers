# GovDecision — Discretionary Powers Management Platform

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-88_passing-brightgreen)
![SaaS](https://img.shields.io/badge/SaaS-multi--tenant-blue)

**Multi-tenant SaaS platform for government decision management**

A white-label platform enabling governments to manage the structured exercise of discretionary powers. Each jurisdiction gets configurable workflows, branded portals, and cryptographic audit trails — ensuring transparency, accountability, and compliance with administrative law.

Originally built for the Government of the British Virgin Islands following the 2022 Commission of Inquiry governance reforms.

## Architecture

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| Frontend        | Next.js 15 (App Router), TypeScript    |
| Backend API     | ASP.NET Core (.NET 10), C#             |
| Database        | PostgreSQL 17 + Entity Framework Core  |
| Multi-tenancy   | Organization-scoped with EF Core global query filters |
| Auth            | JWT Bearer + role-based + tenant-scoped policies |
| UI              | Tailwind CSS 4 + Radix UI (white-label) |
| Storage         | MinIO (S3-compatible), tenant-isolated |
| Email        | MailKit + Mailpit (dev)                |
| Cache        | Redis 7                                |
| Testing      | Vitest + Playwright (frontend), xUnit (backend) |

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) 22+
- [Docker](https://www.docker.com/) and Docker Compose

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd discretionary-powers

# Start infrastructure services
docker compose -f docker/docker-compose.dev.yml up -d

# Start the backend API
cd backend
dotnet run --project src/DiscretionaryPowers.Api

# In a separate terminal — start the frontend
npm install
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- Swagger docs: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- MinIO Console: [http://localhost:9001](http://localhost:9001)
- Mailpit Web UI: [http://localhost:8025](http://localhost:8025)

## Demo Credentials

| Email                        | Password   | Role                 |
| ---------------------------- | ---------- | -------------------- |
| minister@gov.vg              | password   | Minister             |
| secretary@gov.vg             | password   | Permanent Secretary  |
| legal@gov.vg                 | password   | Legal Advisor        |
| auditor@gov.vg               | password   | Auditor              |
| superadmin@govdecision.com   | password   | Super Admin (SaaS)   |

## Project Structure

```
├── backend/                          # C#/.NET Web API
│   └── src/
│       ├── DiscretionaryPowers.Domain/        # Entities, enums, workflow
│       ├── DiscretionaryPowers.Application/   # Services, DTOs, validators
│       ├── DiscretionaryPowers.Infrastructure/# EF Core, S3, email
│       └── DiscretionaryPowers.Api/           # Controllers, auth, middleware
├── src/                              # Next.js frontend
│   ├── app/                          # Pages (App Router)
│   │   ├── (staff)/                  # Staff portal (authenticated)
│   │   └── (public)/                 # Public transparency portal
│   ├── components/                   # UI components
│   ├── lib/                          # API client, utilities
│   └── modules/                      # Client-side business logic
├── docker/                           # Docker Compose configuration
└── tests/                            # Test files
```

## Available Scripts

### Frontend
| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start development server             |
| `npm run build`      | Build for production                 |
| `npm run lint`       | Run ESLint                           |
| `npm test`           | Run unit tests (Vitest)              |
| `npm run test:e2e`   | Run E2E tests (Playwright)           |

### Backend
| Command                                              | Description              |
| ---------------------------------------------------- | ------------------------ |
| `dotnet run --project src/DiscretionaryPowers.Api`   | Start API server         |
| `dotnet build`                                        | Build solution           |
| `dotnet test`                                         | Run unit tests           |
| `dotnet ef database update`                           | Apply EF migrations      |

## API Documentation

The API follows REST conventions with JWT Bearer authentication. Full OpenAPI/Swagger documentation is available at `/swagger` when the API is running.

Key endpoints:
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/decisions` — List decisions (filtered, paginated)
- `POST /api/decisions` — Create a new decision
- `PUT /api/decisions/{id}/steps/{stepNumber}` — Advance workflow step
- `GET /api/decisions/public` — Public transparency endpoint
- `GET /api/health` — Health check

## Standards Compliance

- **WCAG 2.2 AA** — Accessible design with Radix UI primitives
- **ISO 27001** — Security controls, encryption, audit logging
- **OWASP Top 10** — Parameterised queries, JWT auth, CORS, rate limiting
- **BVI 10-Step Framework** — Enforced as workflow state machine

## Documentation

| Document | Description |
| -------- | ----------- |
| [User Guide](docs/user-guide.md) | Guide for government staff using the system |
| [Admin Guide](docs/admin-guide.md) | Deployment, database, monitoring, and security |
| [API Reference](docs/api-reference.md) | Complete REST API documentation |
| [Security Checklist](docs/security-checklist.md) | Pre-deployment security review |

## License

Crown Copyright, Government of the Virgin Islands. All rights reserved.
