# Pipeline guide (client + server)

This project is a **monorepo** with two apps:

- `client/`: Vue 3 + Vite + TypeScript
- `server/`: NestJS + Prisma + TypeScript

## Prerequisites

- Node.js (recommended: current LTS)
- npm

## Install dependencies

```bash
cd client
npm install
```

```bash
cd server
npm install
```

## Local development

### Server

```bash
cd server
npm run start:dev
```

- API base prefix: `/booking/api/`
- Swagger UI: `/booking/api/docs`

### Client

```bash
cd client
npm run dev
```

Client expects API at `VITE_API_URL` (see `client/src/api/index.ts`). If not set, it defaults to:

- `http://localhost:3000/booking/api`

## Build (production)

### Client

```bash
cd client
npm run build
```

### Server

```bash
cd server
npm run build
```

## Lint

### Server

```bash
cd server
npm run lint
```

Client lint is not configured yet (no ESLint script in `client/package.json`).

## Docs pipeline

- **UI components**: Storybook (client) → see `docs/CLIENT_UI.md`
- **API docs**: Swagger/OpenAPI (server) → see `docs/SERVER_API.md`

