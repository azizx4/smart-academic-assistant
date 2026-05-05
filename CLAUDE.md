# CLAUDE.md — Smart Academic Read-Only Assistant (SARA)

## Project Identity
Graduation project: a secure, read-only AI academic assistant widget for students and faculty.
Project name: SARA (Smart Academic Read-Only Assistant)

## What SARA Is
A lightweight AI chat widget that sits in the corner of a student portal — similar to TryHackMe style.
Students and faculty can ask academic questions in natural language (including Saudi dialect) and get instant answers from their own scoped data.

## What SARA Is NOT
- NOT a full university platform
- NOT a replacement for PeopleSoft or any SIS
- A proof-of-concept demonstrating feasibility, flexibility, and clean architecture

## Primary Goal
Build a production-minded prototype that:
- Works in strict read-only mode — no write/update/delete on academic data
- Enforces role-based access at the backend level
- Separates AI reasoning from authorization decisions
- Supports swappable AI providers (OpenAI / Ollama / Gemini)
- Understands Saudi Arabic dialect
- Is well-documented and testable

## Non-Negotiable Rules
1. **AI ≠ Authorizer**: The AI model NEVER decides who can see what. Backend enforces all access control.
2. **Read-Only by Design**: No API endpoints exist for write/update/delete on academic data. ReadOnlyGuard middleware rejects non-GET methods.
3. **Backend = Gatekeeper**: Identity verification, role checks, and data scoping happen ONLY in the backend.
4. **AI = Interpreter**: The AI receives only pre-filtered, authorized data and formats responses.
5. **Document Everything**: Every major technical decision is recorded in docs/.
6. **Least Privilege**: Every query is scoped to the minimum data the user's role allows.

## Architecture
```
[React Client] → [Express API + Auth Middleware + ReadOnly Guard]
                         ↓
              [Service Layer — scoped queries]
                         ↓
              [Prisma ORM → SQLite/PostgreSQL]
                         ↓
              [AI Provider (Gemini/OpenAI/Ollama) — receives filtered data only]
                         ↓
              [Formatted response → Client]
```

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| AI | Google Gemini (free) / OpenAI / Ollama (swappable) |
| Testing | Vitest + Supertest |

## Roles
| Role | Permissions |
|------|------------|
| student | View own grades, absences, schedule, plan, alerts, courses, news |
| faculty | View own courses, enrolled students, absence reports, news |

## Middleware Chain
```
Request → RateLimiter → AuthMiddleware (JWT) → RoleGuard → ReadOnlyGuard → Controller
```

## AI Intent Detection
Supports: grades, absences, schedule, student_courses, plan, alerts, news, faculty_courses, faculty_absences, greeting, help, overall_status, write_rejected, unavailable

Understands Saudi dialect: وش، ابي، عطني، وريني، كم، وين، متى

## File Structure
```
smart-academic-assistant/
├── client/src/
│   ├── App.jsx, main.jsx
│   ├── pages/ (LoginPage, ChatPage, WidgetDemoPage)
│   ├── components/ (ChatWidget, ChatMessage, TypingIndicator, QuickActions)
│   ├── hooks/ (useAuth)
│   ├── services/ (api.js)
│   └── styles/ (index.css)
├── server/src/
│   ├── index.js, config/
│   ├── middleware/ (auth, role, readonly, rate-limiter, error-handler)
│   ├── routes/ (auth, grades, absences, schedule, plan, alerts, news, faculty, chat, health)
│   ├── controllers/ (matching routes)
│   ├── services/ (matching routes + chat.service)
│   └── providers/ (base, openai, ollama, gemini, factory, system-prompt)
├── server/prisma/ (schema + seed)
├── server/tests/ (middleware.test.js)
├── docs/ (5 documentation files)
└── CLAUDE.md, README.md, .env.example
```

## API Endpoints
| Method | Path | Role |
|--------|------|------|
| POST | /api/auth/login | public |
| GET | /api/auth/me | authenticated |
| GET | /api/grades | student |
| GET | /api/absences | student |
| GET | /api/schedule | student |
| GET | /api/plan | student |
| GET | /api/alerts | student |
| GET | /api/news | all |
| GET | /api/faculty/courses | faculty |
| GET | /api/faculty/courses/:code/students | faculty |
| GET | /api/faculty/absences/excessive | faculty |
| POST | /api/chat | all |
| GET | /api/health | public |

## Current Status: COMPLETE
All phases (0-6) implemented and working:
- Phase 0: Scaffolding + docs
- Phase 1: Backend + auth + middleware
- Phase 2: API endpoints + services
- Phase 3: AI chat + provider abstraction + Gemini
- Phase 4: React frontend + portal UI
- Phase 5: Saudi dialect support + intent improvements + UI polish
- Phase 6: AI tool-calling architecture — multi-university ready

## Phase 6 — Tool-Calling Architecture (2026-04-15)
Replaced rigid keyword-based intent detection with Gemini function
calling so SARA can be reused at any university by registering new
tools, not rewriting keyword lists.

### Files Added
- `server/src/tools/tool-registry.js` — central registry, role-filtered tool listing, Gemini/OpenAI schema export
- `server/src/tools/tool-executor.js` — safe execution: whitelist check → role check → arg validation → handler
- `server/src/tools/index.js` — bootstrap that registers all tools
- `server/src/tools/*.tool.js` — 9 tools (grades, absences, schedule, plan, alerts, news, excessive-absences, faculty-courses, course-students)
- `server/src/services/conversation-memory.js` — in-process per-user memory (5 turns, 30min TTL)
- `server/src/providers/system-prompt.js` — new `TOOL_SYSTEM_PROMPT` with strict rules
- `server/tests/tools.test.js` — 34 tests (registry, executor, role matrix)
- `server/tests/chat.test.js` — 12 tests (pre-filter, tool flow, legacy fallback)
- `server/scripts/live-chat-test.mjs` + `live-focused-test.mjs` — real-HTTP smoke tests

### Files Modified
- `server/src/providers/base.provider.js` — added `supportsTools()`, `selectTool()`, `respondWithToolResults()`
- `server/src/providers/gemini.provider.js` — full function-calling implementation + conversation history
- `server/src/services/chat.service.js` — rewritten: pre-filter → tool-calling flow → legacy fallback. Fixed write-attempt regex false positive ("معدلي" was matching "عدل")

### Flow
```
User message → cannedResponse (greeting/help/write/unavailable)
            ↓ (if not canned)
            Provider.supportsTools()?
              ✓ → selectTool() → executeTool() → respondWithToolResults()
              ✗ or error → Legacy keyword flow
            ↓
            appendTurn(userId, message, reply)  // memory
```

### Security Invariants Preserved
- Tool registry stores definitions only (no authorization decisions)
- `ToolExecutor` re-validates role for every call — AI selection is advisory only
- Registry only contains READ tools — no way for AI to invoke writes
- Tests cover cross-role attack matrix (student invoking faculty tools → FORBIDDEN)

### Current Tool Inventory
| Tool | Role | Purpose |
|------|------|---------|
| `get_student_grades` | student | grades + GPA (optional courseCode filter) |
| `get_student_absences` | student | grouped by course (optional courseCode) |
| `get_student_schedule` | student | weekly timetable (optional dayOfWeek) |
| `get_student_plan` | student | degree plan (optional status filter) |
| `get_student_alerts` | student | notifications (optional unreadOnly) |
| `get_news` | student + faculty | university news (optional category) |
| `get_excessive_absences` | faculty | at-risk students (configurable limit) |
| `get_faculty_courses` | faculty | faculty's courses with enrollment counts |
| `get_course_students` | faculty | roster — if courseCode omitted, returns ALL courses' rosters |

## Phase 6.1 — Large Dataset + Intent Disambiguation (2026-04-17)
Scaled seed data from ~3 users to a realistic university dataset, and
fixed Gemini's confusion between absences and grades tools.

### Seed Overhaul (`server/prisma/seed.js`)
- **30 faculty** (18 male + 10 female + 2 original), **300 students** (441001–441300), **20 courses** across 8 departments
- Deterministic PRNG (`mulberry32(42)`) — same data every run
- Realistic Saudi names (male + female pools, family names)
- Grade distribution: A+ 5% → F 10%, with midterm/final/assignments breakdown
- Absence profiles: 80% low (0–2), 15% medium (3–4), 5% high (5–8)
- Alerts auto-generated from actual absence counts and failing grades
- 10 news items (announcements, competitions, events)
- Batch inserts in chunks of 100 for SQLite compatibility
- Original test accounts preserved: `441001`, `441002`, `dr.omar`

### Tool Description Enhancement (`server/src/tools/absences.tool.js`)
- Expanded `get_student_absences` description with exhaustive Arabic dialect examples
- Explicitly tells Gemini: "غايب/اغيب/غبت = absences, NOT grades or schedule"
- Same treatment for `get_excessive_absences` (faculty tool)

### System Prompt Expansion (`server/src/providers/system-prompt.js`)
- Added **"تمييز الأدوات — كلمات مفتاحية"** section to `TOOL_SYSTEM_PROMPT` — maps keyword groups to specific tools
- Massively expanded `INTENT_PATTERNS` — each intent now has 30–40+ regex patterns covering formal Arabic, Saudi dialect, and English
- New patterns cover edge cases: "كم مره بالاسبوع", "توريني", "هل انحرمت", "am I at risk", etc.

### Chat Service Fix (`server/src/services/chat.service.js`)
- When Gemini returns plain text (no tool call) but legacy keywords match a known intent → falls back to legacy flow instead of returning empty/generic AI text
- Prevents the scenario where Gemini "understands" but doesn't call a tool

### Files Modified
| File | Change |
|------|--------|
| `server/prisma/seed.js` | Complete rewrite — large procedural dataset |
| `server/src/tools/absences.tool.js` | Rich tool descriptions with dialect examples |
| `server/src/providers/system-prompt.js` | Keyword disambiguation section + expanded INTENT_PATTERNS |
| `server/src/services/chat.service.js` | Gemini-text-but-legacy-match fallback |

## Phase 6.2 — Bilingual Responses + Bug Fixes (2026-04-18)
SARA now replies in the same language as the user's question.
English question → English response. Arabic/dialect → Arabic.

### Language Detection (`chat.service.js: isEnglish()`)
- Counts Latin vs Arabic characters — simple, effective heuristic
- Passed through all code paths: canned responses, legacy fallback, overall status

### Bilingual Canned Responses
- `greeting`, `help`, `write_rejected`, `unavailable` — all have EN + AR versions
- Faculty and student variants for greeting + help

### Bilingual Fallback Formatter
- `formatFallback()` now accepts `en` flag
- Uses `courseNameEn`/`nameEn` for English, `courseNameAr`/`nameAr` for Arabic
- `handleOverallStatus()` — bilingual summary

### Alert Translation
- Alerts are stored Arabic-only in DB (generated by seed)
- `translateAlertTitle()` + `translateAlertBody()` — regex-based translation of the 4 known alert templates
- Course names inside alert body remain Arabic (acceptable — course codes are always visible)

### Additional Bug Fixes in This Session
| Bug | Fix |
|-----|-----|
| `isHelp` matched any `?` in message | Separated `?` to standalone `^\s*\?+\s*$` |
| News duplicated 3x | Added `prisma.news.deleteMany({})` to seed clear section |
| "courses left to graduate" → student_courses | Moved `plan` before `student_courses` in INTENT_PATTERNS |
| Faculty absences matched as student absences | Added `roleRequired: "student"` to absences intent |
| `/student.*absent/i` didn't match "absences" | Changed to `/student.*absen/i` (absent ≠ absence) |
| "عطني خطتي" didn't match plan | Changed `/خطة/i` → `/خط[ةت]/i` (ة vs ت) |
| "class roster" not recognized for faculty | Added `/roster/i`, `/class roster/i` to faculty_courses |
| `/class/i` too broad in schedule | Removed bare `/class/i`, kept specific patterns |

### Files Modified
| File | Change |
|------|--------|
| `server/src/services/chat.service.js` | `isEnglish()`, bilingual canned/fallback/alerts/overall, isHelp fix |
| `server/src/providers/system-prompt.js` | INTENT_PATTERNS: reorder, roleRequired, regex fixes, new patterns |
| `server/prisma/seed.js` | Added news deleteMany to clear section |

## Running Locally
- Backend port: **3001** (NOT 3000 — that port is occupied by Smart SIS UHB Next.js app on this machine)
- `PORT=3001 node server/src/index.js`
- Client: `cd client && npm run dev` → http://localhost:5173
- Vite proxy in `client/vite.config.js` already points to 3001

## Gemini Free Tier Constraints
- Limit: **5 `generateContent` requests per minute** on gemini-2.5-flash
- Each tool-calling chat turn = **2 Gemini calls** (selectTool + respondWithToolResults) → ~2 AI questions per minute
- Canned responses (greeting/help/write/unavailable) do NOT hit Gemini
- When quota exceeded, legacy keyword flow kicks in automatically

## Decision Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-08 | SQLite for dev | Zero-config development |
| 2026-04-08 | Prisma as ORM | Type-safe, multi-DB support |
| 2026-04-08 | JWT for auth | Simple, stateless |
| 2026-04-08 | AI Provider abstraction | Swap between AI services without refactoring |
| 2026-04-08 | ReadOnlyGuard middleware | Defense-in-depth |
| 2026-04-10 | Google Gemini as default AI | Free tier, no credit card needed |
| 2026-04-10 | Saudi dialect in intent detection | Core UX requirement for target users |
| 2026-04-10 | Portal as demo shell only | Project is the widget, not the portal |
| 2026-04-15 | Tool-calling over keyword intents | Flexibility: new tool = new capability, no keyword maintenance. Enables multi-university reuse |
| 2026-04-15 | Registry pattern + separate executor | Defense-in-depth: AI selects, backend enforces. AI hallucination → TOOL_NOT_FOUND |
| 2026-04-15 | Pre-filter canned responses | Skip Gemini for greetings/writes/unavailable → saves quota, zero latency for common cases |
| 2026-04-15 | In-process conversation memory | Simple Map with TTL. POC scope — swap to Redis for production |
| 2026-04-15 | Legacy keyword flow kept as fallback | Defense-in-depth when Gemini is rate-limited or down |
| 2026-04-17 | Large procedural seed (300 students, 30 faculty, 20 courses) | Realistic dataset for demo/testing; deterministic PRNG for reproducibility |
| 2026-04-17 | Rich tool descriptions with dialect examples | Gemini was confusing absences with grades — explicit keyword mapping in tool descriptions fixes it |
| 2026-04-17 | Expanded INTENT_PATTERNS (30-40+ per intent) | Legacy fallback needs broad coverage; covers formal Arabic, dialect, and English |
| 2026-04-17 | Gemini-text fallback to legacy when keywords match | Gemini sometimes returns text without calling a tool — legacy flow catches it |
| 2026-04-18 | Bilingual responses (EN/AR) | Reply in user's language — Latin/Arabic char count heuristic |
| 2026-04-18 | Alert body translation via regex | Seed generates Arabic-only alerts; 4 regex templates cover all alert types |

## Working Style
- Explain in Arabic; use English for technical names
- Be concise, structured, technically honest
- Critique weak design choices directly
- Keep scope focused — this is a graduation project proof-of-concept
