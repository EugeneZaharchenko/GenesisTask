# GitHub Release Notifier

Subscribe to email notifications when a GitHub repository publishes a new release.

## Stack

- Node.js + Express
- SQLite (better-sqlite3)
- Nodemailer (Ethereal for dev)

## Setup

```bash
cp .env.example .env   # fill in API_KEY
npm install
npm start
```

## Docker

```bash
docker compose up --build
```

## API

All endpoints require `X-API-Key` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscribe` | Subscribe to a repo `{ "email": "...", "repo": "owner/repo" }` |
| GET | `/api/confirm/:token` | Confirm subscription |
| GET | `/api/unsubscribe/:token` | Unsubscribe |
| GET | `/api/subscriptions?email=` | List confirmed subscriptions |
| GET | `/metrics` | Prometheus metrics (no auth) |
| GET | `/health` | Health check (no auth) |

## How it works

1. Subscribe → receive confirmation email (Ethereal preview URL in console)
2. Confirm via the link in the email
3. Scanner checks GitHub every 5 min — emails you when a new release tag appears

## Dev

```bash
npm run dev    # watch mode
npm test       # Jest unit + E2E tests
npm run lint   # ESLint
```
