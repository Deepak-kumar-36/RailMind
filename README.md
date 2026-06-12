# RailMind

AI-powered railway emergency intelligence platform built with Next.js, Express, Socket.IO, Gemini, and Neon PostgreSQL.

## Features

- Dark emergency operations dashboard
- Railway digital twin with live Socket.IO telemetry
- Six visible AI agents for track, weather, operations, power, passenger safety, and approval governance
- Human approval layer for safety-critical recommendations
- Gemini-backed incident analysis with a local fallback when `GEMINI_API_KEY` is not configured
- Neon PostgreSQL approval audit logging when `DATABASE_URL` is configured
- Mobile responsive layout

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` or export these variables before starting the server:

```bash
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_postgres_connection_string
PORT=3000
```

Without these values, RailMind still runs with local AI fallback and in-memory approval state.

## Checks

```bash
npm run typecheck
npm run build
```
