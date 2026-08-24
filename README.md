# URL Shortener

Production-grade URL shortener with Fastify, React, MongoDB, Redis, and Nginx.

## Architecture

```
Client → Nginx → 3× Fastify → MongoDB (unique index)
                    ↓
                  Redis (cache)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 20, TypeScript, Fastify |
| Database | MongoDB (Mongoose) |
| Cache | Redis (ioredis) |
| Frontend | React 18, TypeScript, Vite, TanStack Query |
| Styling | Tailwind CSS |
| Proxy | Nginx (load balancing) |
| Container | Docker Compose |

## Features

- **Short URLs** – 7-char Base62 codes, collision-safe via MongoDB unique index + retry
- **Expiration** – Never / 1h / 1d / 7d / 30d / custom date
- **Analytics** – Click count, created/last-accessed timestamps
- **Security** – URL validation, rate limiting (100 req/15min), Helmet headers, strict CORS
- **Scalability** – Stateless replicas behind Nginx, Redis caching, connection pooling
- **Observability** – Structured logging, `/health` endpoint, consistent error responses

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/urls` | Create short URL |
| GET | `/api/v1/urls` | List URLs (paginated, searchable) |
| GET | `/api/v1/urls/:code` | Get URL details |
| PATCH | `/api/v1/urls/:code/expiration` | Update expiration |
| DELETE | `/api/v1/urls/:code` | Soft delete |
| GET | `/api/v1/urls/:code/analytics` | Get analytics |
| GET | `/:code` | Redirect (302) |
| GET | `/health` | Health check |

**Create Example**
```bash
curl -X POST http://localhost/api/v1/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com/very/long/url"}'
```

## Quick Start

```bash
cp .env.example .env
docker-compose up -d --build
```

- Frontend: http://localhost
- API: http://localhost/api
- Health: http://localhost/health
- Swagger: http://localhost/docs

## Local Development

```bash
npm install
npm run dev          # Both frontend (5173) and backend (3000)
npm run dev:server   # Backend only
npm run dev:client   # Frontend only
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://mongo:27017/url-shortener` | MongoDB connection |
| `REDIS_HOST` | `redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_TTL_SECONDS` | `3600` | Cache TTL |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |
| `RATE_LIMIT_MAX` | `100` | Requests per window |
| `SHORT_CODE_LENGTH` | `7` | Code length |
| `SHORT_CODE_MAX_RETRIES` | `5` | Collision retries |

## Docker Deploy

```bash
docker-compose build
docker-compose up -d
docker-compose up -d --scale server=5  # Scale replicas
```

## Project Structure

```
url-shortener/
├── client/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   └── types/
│   └── Dockerfile
├── server/          # Fastify + TypeScript
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── types/
│   └── Dockerfile
├── nginx/           # Nginx reverse proxy
├── docker-compose.yml
├── .env.example
└── README.md
```

## Testing

```bash
npm run test        # Backend unit tests (19 passing)
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```

## License

MIT
