# Succeed Take-Home Project

This is a fullstack competition management platform for schools. The project uses a monorepo structure with Turborepo, containing both frontend and backend applications.

## Technologies Used

### Frontend
- Next.js
- React 19
- TypeScript
- Tailwind CSS
- SWR for data fetching
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL/Supabase
- JWT for authentication
- Zod for validation

## Project Structure

The project is organized as a monorepo using Turborepo and pnpm workspaces:

```
succeed-take-home/
├── apps/
│   ├── frontend/  # Next.js application
│   └── backend/   # Express API server
├── packages/      # Shared packages
└── ...
```

## Prerequisites

- Node.js >= 18
- pnpm (for package management)
- PostgreSQL database

## Setup and Installation

1. **Clone the repository**

```bash
git clone https://github.com/jdamilola/succeed-take-home
cd succeed-take-home
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment Configuration**

Set up the backend environment variables by creating a `.env` file in the `apps/backend` directory using the provided `.env.example` as a template:

```
# Server Configuration
PORT=9999
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Database Connection
DATABASE_URL=postgres://username:password@localhost:5432/database
```

4. **Database Setup**

```bash
# Generate schema
pnpm --filter backend db:generate

# Run migrations
pnpm --filter backend db:migrate

# Seed the database with initial data
pnpm run db:seed
```

5. **Start the development servers**

```bash
# Start both frontend and backend in development mode
pnpm run dev
```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:9999.

## Key Features

- Multi-tenant architecture with school isolation
- Authentication and authorization with JWT
- CRUD operations for competitions
- Competition participation management
- Different visibility modes for competitions (public, private, restricted)

## Data Model

The application uses the following main data entities:

- **Schools**: Represents educational institutions (tenants)
- **Users**: School administrators and students
- **Competitions**: Events created by school administrators
- **Competition Access**: Controls which schools can access restricted competitions
- **Competition Participants**: Tracks which users are participating in competitions

## Development Workflows

- **Run app in development**: `pnpm run dev`
- **Building for production**: `pnpm run build`
- **Running tests**: `pnpm run test`
- **Type checking**: `pnpm run typecheck`
- **Linting**: `pnpm run lint`

## Design Decisions

- **Monorepo Structure**: Chosen for code sharing and simplified dependency management
- **Multi-tenant Design**: Each school has isolated data with cross-school access for specific competitions
- **Drizzle ORM**: Used for its type-safety and modern approach to database interactions
- **JWT Authentication**: Implemented for secure, stateless authentication
- **Next.js Frontend**: Provides excellent developer experience and performance benefits
