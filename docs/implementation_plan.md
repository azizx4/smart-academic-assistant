# Implementation Plan — SARA

## Phase Overview

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Project scaffolding and documentation | COMPLETE |
| Phase 1 | Backend core (Express + Prisma + Auth) | COMPLETE |
| Phase 2 | API endpoints and services | COMPLETE |
| Phase 3 | AI chat integration | COMPLETE |
| Phase 4 | React frontend and portal UI | COMPLETE |
| Phase 5 | Polish, dialect support, Gemini | COMPLETE |

## Phase 0 — Scaffolding
- Created project structure (client/ + server/)
- Wrote CLAUDE.md, README.md
- Created docs/ with 5 documentation files
- Created .env.example with all variables
- Created setup.ps1 for Windows

## Phase 1 — Backend Core
- Express server with middleware chain
- Prisma schema: 9 models (User, Course, Enrollment, Grade, Absence, Schedule, AcademicPlan, Alert, News)
- JWT authentication with bcrypt
- Middleware: AuthMiddleware, RoleGuard, ReadOnlyGuard, RateLimiter, ErrorHandler
- Mock data seed script (3 students, 2 faculty, 4 courses, full data)
- 16 unit tests for middleware

## Phase 2 — API Endpoints
- 13 RESTful endpoints (see CLAUDE.md for full list)
- Controllers following MVC pattern
- Services with scoped queries (students see own data only)
- GPA calculation service
- Absence grouping by course
- Academic plan summary (completed/in-progress/remaining)

## Phase 3 — AI Chat
- AI Provider abstraction (BaseAIProvider)
- OpenAI provider (GPT-4o-mini)
- Ollama provider (local Llama 3.2)
- Google Gemini provider (FREE — added in Phase 5)
- Factory pattern for provider selection
- Intent detection with regex patterns
- System prompt defining SARA's behavior
- Chat service: intent → scoped data → AI → response
- Fallback mode when AI is unavailable
- Write attempt detection and rejection
- Unavailable feature detection

## Phase 4 — Frontend
- React 18 + Vite + TailwindCSS
- Auth system (AuthProvider + useAuth hook)
- API service with in-memory token management
- Login page with demo accounts
- Full-screen chat page
- Portal demo page (WidgetDemoPage) with:
  - Collapsible sidebar
  - Arabic/English toggle with RTL/LTR
  - Student views: overview, grades, schedule, absences, plan, alerts, news
  - Faculty views: overview, courses, excessive absences, news
  - All data from real backend APIs
- ChatWidget: floating, embeddable, shared session

## Phase 5 — Polish
- Google Gemini as default AI provider (free, no credit card)
- Saudi dialect support in intent detection
- New intents: student_courses, help, overall_status
- Unavailable feature graceful handling
- UI improvements: wider layout, thinner sidebar, colored borders, better plan colors
- Updated all documentation

## Future Work (Not Required for Graduation)
- Email-based news ingestion
- PostgreSQL + Docker for production
- Multi-university adapter pattern
- Integration and E2E tests
- Mobile-responsive optimization
- Conversation history/context
