# Discretionary Powers Management System

**Government of the Virgin Islands**

A digital platform for managing the 10-step framework for the exercise of discretionary powers in the British Virgin Islands. The system guides government officers through each stage of the decision-making process, ensuring transparency, accountability, and compliance with established procedures.

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Framework    | Next.js 15 (App Router)          |
| Language     | TypeScript                        |
| Database     | PostgreSQL 17 + Drizzle ORM      |
| API          | tRPC v11                          |
| Auth         | NextAuth.js v5                    |
| UI           | Tailwind CSS 4 + Radix UI        |
| Storage      | MinIO (S3-compatible)             |
| Email        | Nodemailer + Mailpit (dev)        |
| Cache        | Redis 7                           |
| Testing      | Vitest + Playwright               |

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Docker](https://www.docker.com/) and Docker Compose

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd discretionary-powers

# Copy environment variables
cp .env.example .env

# Start infrastructure services
docker compose -f docker/docker-compose.dev.yml up -d

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

**Other services:**
- MinIO Console: [http://localhost:9001](http://localhost:9001)
- Mailpit Web UI: [http://localhost:8025](http://localhost:8025)
- Drizzle Studio: `npm run db:studio`

## Project Structure

```
src/
  app/            # Next.js App Router pages and layouts
  components/     # Reusable UI components
  db/             # Database schema and migrations
  lib/            # Shared utilities and configuration
  modules/        # Feature modules
  server/         # tRPC routers and server-side logic
  types/          # TypeScript type definitions
docker/           # Docker and Docker Compose configuration
tests/            # Test files
```

## Available Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start development server             |
| `npm run build`      | Build for production                  |
| `npm start`          | Start production server               |
| `npm run lint`       | Run ESLint                            |
| `npm test`           | Run unit tests (Vitest)               |
| `npm run test:e2e`   | Run end-to-end tests (Playwright)     |
| `npm run db:generate`| Generate database migrations          |
| `npm run db:migrate` | Run database migrations               |
| `npm run db:studio`  | Open Drizzle Studio                   |

## License

Crown Copyright, Government of the Virgin Islands. All rights reserved.
