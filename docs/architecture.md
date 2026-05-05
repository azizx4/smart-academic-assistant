# Architecture — SARA

## System Overview

SARA follows a three-tier architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React)                     │
│  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │  ChatWidget   │  │      Portal UI (Demo)       │  │
│  │  (floating)   │  │  Grades/Schedule/Plan/etc   │  │
│  └──────┬───────┘  └──────────┬──────────────────┘  │
│         └──────────┬──────────┘                      │
│                    │ API calls (/api/*)               │
└────────────────────┼─────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────┐
│               EXPRESS SERVER                          │
│                    │                                  │
│  ┌─────────────────▼──────────────────────────────┐  │
│  │          Middleware Chain                        │  │
│  │  RateLimiter → Auth(JWT) → RoleGuard → ReadOnly │  │
│  └─────────────────┬──────────────────────────────┘  │
│                    │                                  │
│  ┌─────────────────▼──────────────────────────────┐  │
│  │          Controllers + Services                  │  │
│  │     (scoped queries per user/role)               │  │
│  └─────────────────┬──────────────────────────────┘  │
│                    │                                  │
│  ┌─────────────────▼──────────────────────────────┐  │
│  │         AI Provider Abstraction                  │  │
│  │    Gemini (free) / OpenAI / Ollama               │  │
│  │    Receives ONLY pre-filtered data               │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────┐
│            DATABASE (Prisma ORM)                      │
│         SQLite (dev) / PostgreSQL (prod)              │
│                                                       │
│  Users, Courses, Enrollments, Grades, Absences,       │
│  Schedules, AcademicPlans, Alerts, News               │
└──────────────────────────────────────────────────────┘
```

## Data Flow — Chat Request

1. User types question in ChatWidget
2. POST /api/chat with JWT token
3. Middleware chain validates: rate limit → auth → role
4. Chat service detects intent from message (regex patterns)
5. Service fetches SCOPED data (user can only see their own)
6. Filtered data + question sent to AI provider
7. AI generates natural language response
8. If AI fails → fallback formatter returns structured data
9. Response sent to client

## Security Architecture

The security model follows defense-in-depth:

- **Layer 1 — Rate Limiting**: Prevents brute force and abuse
- **Layer 2 — JWT Authentication**: Verifies user identity
- **Layer 3 — Role Guard**: Ensures user has correct role for endpoint
- **Layer 4 — ReadOnly Guard**: Blocks non-GET methods on data routes
- **Layer 5 — Service Scoping**: Queries filtered by user ID
- **Layer 6 — AI Isolation**: AI receives only pre-filtered data

## AI Provider Pattern

Factory pattern allows swapping AI providers without code changes:

```
BaseAIProvider (abstract)
  ├── GeminiProvider  → Google Gemini API (free)
  ├── OpenAIProvider  → OpenAI GPT-4o-mini
  └── OllamaProvider  → Local Ollama (Llama 3.2)
```

Selected via `AI_PROVIDER` environment variable.

## Frontend Architecture

- Single Page Application (React + Vite)
- ChatWidget is a standalone component — embeddable in any page
- Widget shares auth session with host portal (no double login)
- Vite proxy forwards /api/* to Express backend
- TailwindCSS for styling with custom color palette
- RTL/LTR support with language toggle (Arabic/English)
