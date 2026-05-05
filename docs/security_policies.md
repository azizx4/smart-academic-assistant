# Security Policies — SARA

## Core Security Principle
SARA operates on a strict **read-only** model. No academic data can be created, updated, or deleted through the system.

## Authentication
- JWT-based stateless authentication
- Tokens expire after 1 hour (configurable)
- Passwords hashed with bcrypt (12 salt rounds)
- Token stored in JavaScript memory only — never in localStorage or cookies
- Login endpoint rate-limited to 5 attempts per minute

## Authorization Model
- Role-based access control (RBAC): student, faculty
- Every endpoint protected by RoleGuard middleware
- Students can ONLY access their own data (scoped by user ID in service layer)
- Faculty can ONLY access data for courses they teach

## Middleware Security Chain
Every request passes through (in order):
1. **RateLimiter** — Blocks excessive requests (100/min general, 5/min auth, 30/min chat)
2. **AuthMiddleware** — Validates JWT, attaches user to request
3. **RoleGuard** — Checks user role matches endpoint requirement
4. **ReadOnlyGuard** — Blocks POST/PUT/DELETE/PATCH on data routes

## ReadOnly Enforcement
- Applied to: /api/grades, /api/absences, /api/schedule, /api/plan, /api/alerts, /api/news, /api/faculty
- NOT applied to: /api/auth (needs POST for login), /api/chat (needs POST for messages)
- Defense-in-depth: even if a developer accidentally adds a write route, ReadOnlyGuard blocks it

## AI Security
- AI provider has NO direct database access
- AI receives only pre-filtered, scoped data from backend services
- AI cannot access other users' data — data is filtered BEFORE reaching the AI
- Write attempts detected by regex patterns and rejected before any data fetch
- System prompt explicitly instructs AI to refuse modification requests
- If AI generates unexpected output, fallback formatter provides safe structured response

## Data Scoping Rules
| Data Type | Student Access | Faculty Access |
|-----------|---------------|----------------|
| Grades | Own grades only | Not accessible |
| Absences | Own absences only | Students in their courses |
| Schedule | Own schedule only | Not directly (via courses) |
| Plan | Own plan only | Not accessible |
| Alerts | Own alerts only | Not accessible |
| News | All (public) | All (public) |
| Courses | Via enrollment | Own courses only |

## API Security Headers
- Helmet.js for HTTP security headers
- CORS restricted to configured origin (localhost:5173 in dev)
- Request body limited to 1MB
- JSON-only content type

## What Is NOT Stored
- No session data on server (stateless JWT)
- No tokens in browser storage
- No logs of user queries (privacy)
- No AI conversation history on server
