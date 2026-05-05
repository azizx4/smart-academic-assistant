# Team Contributions — SARA Project
## Smart Academic Read-Only Assistant

---

## 1. Project Manager + AI Engineer (Student 1)

### A. Project Manager Role

**Responsibilities:** Project Planning, Team Coordination, Progress Monitoring, Documentation Management

**What was done:**

- **Project Planning:** Designed the complete project roadmap from Phase 0 (Scaffolding) through Phase 6 (Tool-Calling Architecture). Defined 7 phases with clear deliverables and dependencies between them.
- **Architecture Design:** Defined the system architecture: a three-tier model (React Client -> Express API -> Database) with AI Provider abstraction layer. Established the core principle: "AI != Authorizer" — the AI model never decides who can see what.
- **Documentation Management:** Created and maintained 6 documentation files under `docs/`:
  - `project_overview.md` — Project identity, goals, and scope
  - `requirements.md` — Functional and non-functional requirements
  - `architecture.md` — System architecture diagrams and data flow
  - `security_policies.md` — Security model and data scoping rules
  - `implementation_plan.md` — Phase-by-phase implementation roadmap
  - `demo-script.md` — Demo showcase walkthrough
- **CLAUDE.md Maintenance:** Maintained the comprehensive `CLAUDE.md` file (400+ lines) as the project's living technical reference, documenting every decision, phase, file change, and design rationale.
- **Decision Logging:** Recorded 17 major technical decisions with dates and rationale (e.g., why SQLite for dev, why Gemini over OpenAI, why tool-calling over keyword intents).
- **Team Coordination:** Defined clear role boundaries and ensured each role's work integrates correctly (middleware chain order, route registration, provider factory pattern).

---

### B. AI Engineer Role (shared with Student 4)

**Responsibilities:** AI Assistant Development, Natural Language Processing, AI Integration

**What was done (jointly with Student 4 — see Student 4 section for split):**

- **AI Provider Abstraction Layer:**
  - `server/src/providers/base.provider.js` — Abstract base class with interface: `generateResponse()`, `supportsTools()`, `selectTool()`, `respondWithToolResults()`
  - `server/src/providers/factory.js` — Factory pattern that instantiates the correct provider based on `AI_PROVIDER` env variable
  - `server/src/providers/gemini.provider.js` — Full Google Gemini integration (162 lines):
    - `generateResponse()` — Legacy single-turn text generation
    - `selectTool()` — Function-calling: sends user message + tool schemas, Gemini returns tool call or text
    - `respondWithToolResults()` — Sends tool results back to Gemini for natural language formatting
    - Conversation history support via `_historyToContents()`
    - Safety settings configuration
  - `server/src/providers/openai.provider.js` — OpenAI GPT-4o-mini provider (alternative)
  - `server/src/providers/ollama.provider.js` — Local Ollama provider (alternative)

- **System Prompt Engineering (`server/src/providers/system-prompt.js`, 289 lines):**
  - `SYSTEM_PROMPT` — Legacy mode prompt: rules, style, capabilities, restrictions
  - `TOOL_SYSTEM_PROMPT` — Tool-calling mode prompt with:
    - Strict language rules (always respond in English)
    - Tool disambiguation section mapping Arabic/Saudi dialect keywords to specific tools
    - Security rules (read-only, no data fabrication, no cross-user data)
    - Multi-tool calling instructions
  - `INTENT_PATTERNS` — 11 intent categories, each with 30-40+ regex patterns covering:
    - Formal Arabic (e.g., `درجاتي`, `غيابي`, `جدولي`)
    - Saudi dialect (e.g., `وش جايب`, `كم غبت`, `ابي اعرف`)
    - English (e.g., `show my grades`, `am I passing`, `absence report`)
    - Role-restricted patterns (`roleRequired: "student"` or `"faculty"`)

- **Tool-Calling Architecture (Phase 6):**
  - `server/src/tools/tool-registry.js` — Central registry class (86 lines):
    - `register()` — Validates and stores tool definitions (name, description, roles, parameters, handler)
    - `listForRole()` — Returns only tools the user's role can access
    - `toGeminiSchema()` / `toOpenAISchema()` — Exports tool definitions in provider-specific formats
  - `server/src/tools/tool-executor.js` — Safe execution pipeline (65 lines):
    - Step 1: Verify tool exists in registry (whitelist check)
    - Step 2: Verify user's role is allowed (re-validation, AI selection is advisory only)
    - Step 3: Validate arguments against JSON Schema
    - Step 4: Execute handler
    - Custom `ToolError` class with codes: `TOOL_NOT_FOUND`, `FORBIDDEN`, `INVALID_ARGS`
  - 9 tool definition files (`server/src/tools/*.tool.js`):
    - `grades.tool.js` — `get_student_grades`: fetches grades + GPA, optional courseCode filter
    - `absences.tool.js` — `get_student_absences`: grouped by course, with rich Arabic dialect examples in description
    - `schedule.tool.js` — `get_student_schedule`: weekly timetable, optional dayOfWeek filter
    - `plan.tool.js` — `get_student_plan`: degree plan with status filter
    - `alerts.tool.js` — `get_student_alerts`: notifications, optional unreadOnly filter
    - `news.tool.js` — `get_news`: university news, optional category filter
    - `faculty.tool.js` — `get_faculty_courses`, `get_course_students`, `get_excessive_absences`

- **Conversation Memory (`server/src/services/conversation-memory.js`):**
  - In-process per-user memory using `Map`
  - 5-turn history window, 30-minute TTL
  - `appendTurn()` / `getHistory()` API
  - Enables Gemini to understand context across multiple messages

- **Chat Service Orchestration (`server/src/services/chat.service.js`, 380 lines):**
  - Complete rewrite from keyword-only to tool-calling + fallback architecture:
    1. Pre-filter: canned responses for greetings, help, write attempts, unavailable features (zero AI cost)
    2. Tool-calling flow: `selectTool()` -> `executeTool()` -> `respondWithToolResults()`
    3. Legacy fallback: keyword-based `detectIntent()` -> `fetchDataForIntent()` -> AI or `formatFallback()`
  - Bilingual support: `isEnglish()` heuristic (Latin vs Arabic char count)
  - Alert translation: regex-based translation of 4 Arabic alert templates to English
  - Write-attempt detection with Arabic standalone word boundaries (fixed false positive: "GPA" was matching "modify")
  - Gemini-text fallback: when Gemini returns text without a tool call but legacy keywords match, falls back to legacy flow

---

## 2. Backend Developer (Student 2)

**Responsibilities:** System Development, Role-based Access Implementation, Data Handling

**What was done:**

- **Express Server Setup (`server/src/index.js`, 113 lines):**
  - Express application initialization with security middleware (Helmet, CORS, JSON body limit)
  - Route registration with correct middleware chain order for each group:
    - Public routes: `/api/health` (no auth)
    - Auth routes: `/api/auth` (public POST for login, protected GET for /me)
    - Student data routes: auth + readOnly guard
    - Faculty routes: auth + readOnly guard
    - Chat route: auth + chat rate limiter (POST needed, so no readOnly)
  - 404 handler and global error handler
  - Server startup banner with configuration display

- **Authentication System:**
  - `server/src/controllers/auth.controller.js` — Login controller:
    - Accepts username + password
    - Validates against bcrypt hash in database
    - Generates JWT token with `{ id, username, role }` payload
    - Returns token + user profile (without password hash)
  - `server/src/routes/auth.routes.js` — POST `/login` (with auth rate limiter), GET `/me` (with auth middleware)

- **Service Layer — Scoped Data Queries (7 service files):**
  - `server/src/services/grade.service.js`:
    - `getStudentGrades(userId)` — Fetches grades for enrolled courses only, joins Course for names
    - `getStudentGPA(userId)` — Calculates GPA from letter grades using 4.0 scale
  - `server/src/services/absence.service.js`:
    - `getStudentAbsences(userId)` — Groups absences by course with count and records
    - `getExcessiveAbsences(facultyId, limit=3)` — Finds students in faculty's courses above threshold
  - `server/src/services/schedule.service.js`:
    - `getStudentSchedule(userId)` — Returns weekly timetable from enrolled courses, ordered by day + time
  - `server/src/services/plan.service.js`:
    - `getStudentPlan(userId)` — Degree plan with summary (completed/in_progress/remaining counts)
  - `server/src/services/alert.service.js`:
    - `getStudentAlerts(userId)` — Returns alerts with unread count, ordered by date
  - `server/src/services/news.service.js`:
    - `getNews()` — Public news, ordered by publish date
  - `server/src/services/faculty.service.js`:
    - `getFacultyCourses(facultyId)` — Courses with enrollment counts
    - `getCourseStudents(facultyId, courseCode)` — Roster, verifying faculty owns the course

- **Controllers (7 controller files):**
  - Each controller extracts `req.user.id` and calls the corresponding service
  - Consistent error handling pattern: try/catch with 500 response
  - Controllers for: grades, absences, schedule, plan, alerts, news, faculty

- **Route Definitions (7 route files):**
  - Each route file applies role-specific guards:
    - `roleGuard("student")` on student endpoints
    - `roleGuard("faculty")` on faculty endpoints
    - `roleGuard("student", "faculty")` on shared endpoints (news)
  - Faculty routes include parameterized endpoint: `/courses/:code/students`

- **Configuration (`server/src/config/index.js`):**
  - Centralized config from environment variables with defaults
  - Settings: port, JWT secret/expiry, AI provider, Gemini/OpenAI API keys, rate limit values, CORS origin

---

## 3. Backend Developer (Student 3)

**Responsibilities:** System Development, Role-based Access Implementation, Data Handling

**What was done (shared scope with Student 2 — Student 3 focused on middleware and testing):**

- **Middleware Implementation (`server/src/middleware/`, 5 files):**
  - `auth.middleware.js` (46 lines) — JWT verification:
    - Extracts token from `Authorization: Bearer <token>` header
    - Verifies with `jwt.verify()`, attaches `{ id, username, role }` to `req.user`
    - Separate error messages for missing token, expired token, invalid token
    - Bilingual error messages (Arabic + English)
  - `role.guard.js` (37 lines) — Role-based access:
    - Factory function: `roleGuard(...allowedRoles)` returns middleware
    - Checks `req.user.role` against allowed roles array
    - Returns 403 with `requiredRoles` and `yourRole` in response for debugging
  - `readonly.guard.js` (33 lines) — Write protection:
    - Only allows GET, HEAD, OPTIONS methods
    - Returns 405 with method and path for any write attempt
    - Applied to all data routes but NOT auth/chat (which need POST)
  - `rate-limiter.js` (52 lines) — Three rate limit tiers:
    - General: 100 requests/minute
    - Auth: 5 attempts/minute (brute force protection)
    - Chat: 30 messages/minute
  - `error-handler.js` — Global error handler with structured JSON responses
  - `index.js` — Barrel export for all middleware

- **Testing (`server/tests/`, 245+ test cases):**
  - `server/tests/middleware.test.js` — Unit tests for all middleware:
    - Auth middleware: valid token, missing token, expired token, invalid token
    - Role guard: allowed role passes, wrong role blocked, multiple roles
    - ReadOnly guard: GET allowed, POST/PUT/DELETE/PATCH blocked
    - Rate limiter configuration validation
  - `server/tests/tools.test.js` (34 tests) — Tool system tests:
    - Registry: registration, duplicate rejection, missing fields
    - Role filtering: `listForRole()` returns only authorized tools
    - Schema export: Gemini and OpenAI format validation
    - Executor: successful execution, TOOL_NOT_FOUND, FORBIDDEN, INVALID_ARGS
    - Cross-role attack matrix: student calling faculty tools -> FORBIDDEN
  - `server/tests/chat.test.js` (12 tests) — Chat service tests:
    - Pre-filter: greetings, help, write attempts, unavailable features
    - Tool-calling flow integration
    - Legacy fallback when AI fails
    - Bilingual response detection

---

## 4. AI Engineer (Student 4)

**Responsibilities:** AI Assistant Development, Natural Language Processing, AI Integration

**What was done (shared scope with Student 1 — Student 4 focused on NLP and dialect):**

- **Saudi Dialect NLP:**
  - Designed and implemented 400+ regex patterns across 11 intent categories in `INTENT_PATTERNS`
  - Covered three language registers for each intent:
    - Formal Arabic: `درجاتي`, `الغيابات`, `الجدول الدراسي`
    - Saudi dialect: `وش جايب`, `كم غبت`, `ابي اعرف`, `توريني`, `وريني`
    - English: `show my grades`, `am I passing`, `absence report`
  - Handled dialect-specific edge cases:
    - `معدلي` (my GPA) vs `عدّل` (modify) — standalone word boundary detection
    - `خطة` vs `خطت` — taa marbuta vs taa (ة vs ت)
    - `غايب/اغيب/غبت` — different conjugations of "absent" in dialect
    - `توريني` = `وريني` = `عطني` = `ابي اشوف` — all mean "show me"

- **Intent Detection Engine:**
  - Regex-based pattern matching with role-aware filtering
  - Priority ordering: `plan` before `student_courses` (prevents "courses left to graduate" from matching courses instead of plan)
  - Role restrictions: student absences vs faculty absences use different patterns and `roleRequired` fields
  - 11 intents: grades, absences, schedule, plan, student_courses, alerts, news, faculty_courses, faculty_absences, greeting, help, overall_status

- **Tool Description Engineering:**
  - Wrote rich natural-language descriptions for each tool definition (used by Gemini to select the right tool)
  - `get_student_absences` description includes exhaustive dialect examples: "Use this when the user asks about غايب/اغيب/غبت = absences, NOT grades or schedule"
  - Same treatment for `get_excessive_absences` (faculty tool)
  - This technique fixed Gemini's confusion between absences and grades tools

- **Canned Response System:**
  - Greeting detection: 30+ patterns (Arabic, dialect, English)
  - Help detection: separated `?` to standalone `^\s*\?+\s*$` (fixed false positive where any `?` in message triggered help)
  - Write-attempt detection: 30+ Arabic standalone patterns + 30+ English verb patterns
  - Unavailable feature detection: fees, housing, certificates, parking, library, etc. (30+ patterns)

- **Live Testing Scripts:**
  - `server/scripts/live-chat-test.mjs` — Full HTTP-level test against running server
  - `server/scripts/live-focused-test.mjs` — Focused tests for dialect disambiguation (absences vs grades vs schedule)

---

## 5. Frontend Developer (Student 5)

**Responsibilities:** User Interface Design, Chat Interface Development, User Experience Improvement

**What was done (shared scope with Student 6 — Student 5 focused on pages and routing):**

- **Application Shell (`client/src/App.jsx`):**
  - React Router setup with `BrowserRouter`
  - Route protection: `ProtectedRoute` (redirects to login) and `PublicRoute` (redirects to chat)
  - Three routes: `/login`, `/chat`, `/demo`
  - `AuthProvider` wrapper for global auth state

- **Login Page (`client/src/pages/LoginPage.jsx`, 132 lines):**
  - Clean, modern login form with:
    - Decorative gradient background (sara-50 to sara-100)
    - Blurred circle decorations (CSS blur-3xl)
    - SARA logo with university icon (SVG)
    - Username and password fields with proper autocomplete attributes
    - Loading state with spinning animation
    - Error display with red alert box
  - Demo credential buttons: Student (441001) and Faculty (dr.omar) quick-fill
  - Fully responsive design

- **Chat Page (`client/src/pages/ChatPage.jsx`):**
  - Full-page chat interface for authenticated users
  - Integrates ChatWidget with external token/user (no double login)

- **Widget Demo Page (`client/src/pages/WidgetDemoPage.jsx`):**
  - Simulated student portal showing the ChatWidget as a floating overlay
  - Demonstrates the "embeddable widget" concept — SARA sits in the corner of any existing portal

- **Authentication Hook (`client/src/hooks/useAuth.jsx`):**
  - `AuthProvider` context with:
    - `login(username, password)` — calls API, stores token + user
    - `logout()` — clears token and state
    - `user` state — current authenticated user
    - `loading` / `error` states
  - Token stored in memory only (not localStorage) for security

- **API Service Layer (`client/src/services/api.js`):**
  - Axios or fetch wrapper for all API calls
  - `login()`, `sendMessage()`, `setToken()`, `clearToken()`
  - Automatic `Authorization: Bearer` header injection
  - Base URL configuration for Vite proxy

---

## 6. Frontend Developer (Student 6)

**Responsibilities:** User Interface Design, Chat Interface Development, User Experience Improvement

**What was done (shared scope with Student 5 — Student 6 focused on chat components and styling):**

- **ChatWidget Component (`client/src/components/ChatWidget.jsx`, 118 lines):**
  - Floating chat bubble (bottom-left corner, fixed position, z-index 9999)
  - Two modes: collapsed (circle button with chat icon) and expanded (380x560px panel)
  - Built-in login form when used standalone (without external token)
  - Auto-login when token provided externally (embedded mode)
  - Chat functionality:
    - Message list with auto-scroll to bottom
    - Textarea with Enter-to-send (Shift+Enter for newline)
    - Auto-growing textarea (max 80px height)
    - Typing indicator while waiting for AI response
    - Unread message badge on collapsed button
  - Quick action buttons (role-aware):
    - Student: "Grades", "Absences", "Schedule", "Alerts"
    - Faculty: "My courses", "Absence report", "News"
  - Only shown on first message (disappear after interaction)
  - Logout button (hidden when using external token)

- **ChatMessage Component (`client/src/components/ChatMessage.jsx`):**
  - Message bubble rendering with role-based styling:
    - User messages: right-aligned, colored background
    - Assistant messages: left-aligned, light background with SARA avatar
  - Markdown-like formatting support for AI responses

- **TypingIndicator Component (`client/src/components/TypingIndicator.jsx`):**
  - Three animated bouncing dots
  - Shown while AI is processing the request

- **QuickActions Component (`client/src/components/QuickActions.jsx`):**
  - Horizontal row of pill-shaped buttons
  - Each button sends a predefined message to the chat

- **TailwindCSS Styling (`client/src/styles/index.css`):**
  - Custom color palette: `sara-50` through `sara-900` (teal/green academic theme)
  - `gold-50` through `gold-600` for faculty accent color
  - Custom font family: `font-display` for headings
  - RTL support: widget container uses `direction: rtl`, inputs use `dir="ltr"`
  - Responsive design: `max-h-[80vh]` for widget on small screens
  - Smooth transitions and hover states on all interactive elements

- **Vite Configuration (`client/vite.config.js`):**
  - Dev server proxy: `/api` -> `http://localhost:3001` (avoids CORS in development)
  - React plugin and TailwindCSS integration

---

## 7. Database Engineer

**Responsibilities:** Database Design, Data Organization, Migration Creation

**What was done:**

- **Schema Design (`server/prisma/schema.prisma`, 174 lines):**
  - Designed 9 database models with proper relationships:
    - `User` — id, username, passwordHash, role (student/faculty), nameAr, nameEn, email
    - `Course` — code, nameAr, nameEn, creditHrs, semester, facultyId (belongs to faculty)
    - `Enrollment` — many-to-many between Student and Course (unique constraint on studentId+courseId)
    - `Grade` — studentId, courseId, midterm, final, assignments, total, letterGrade (unique per student+course)
    - `Absence` — studentId, courseId, date, reason
    - `Schedule` — courseId, dayOfWeek, startTime, endTime, room
    - `AcademicPlan` — studentId, courseCode, courseNameAr, semester, status (completed/in_progress/remaining)
    - `Alert` — studentId, title, body, type (warning/info/urgent), isRead
    - `News` — titleAr, titleEn, bodyAr, bodyEn, category, publishedAt
  - Column naming: camelCase in Prisma, snake_case in database via `@map()`
  - Table naming: plural lowercase via `@@map()`
  - Database provider: SQLite for development, PostgreSQL for production (configurable in datasource)

- **Seed Script (`server/prisma/seed.js`, ~400 lines):**
  - **Scale:** 300 students, 30 faculty, 20 courses across 8 departments
  - **Deterministic PRNG:** `mulberry32(42)` — same data every `npm run seed` run
  - **Realistic Saudi names:** 40 male first names + 30 female first names + 30 family names (Arabic + English)
  - **Grade distribution:** A+ 5%, A 10%, B+ 15%, B 20%, C+ 20%, C 15%, D+ 5%, D 5%, F 10% — with midterm/final/assignments breakdown
  - **Absence profiles:** 80% low (0-2), 15% medium (3-4), 5% high (5-8)
  - **Auto-generated alerts:** Based on actual data:
    - Warning when absences >= 3 in a course
    - Urgent when absences >= 5 (denial risk)
    - Grade warning when total < 60
    - Final exam reminder for all students
  - **10 news items:** Announcements, competitions, events — bilingual
  - **Schedule generation:** Realistic weekly timetable with rooms and time slots
  - **Academic plans:** Per-student degree plans with status distribution
  - **Batch inserts:** Chunks of 100 for SQLite compatibility
  - **Original test accounts preserved:** `441001`, `441002`, `dr.omar` with known passwords
  - **Clear section:** Deletes all data in correct order (respecting foreign keys) before re-seeding

- **Prisma Configuration:**
  - `prisma generate` — Generates type-safe Prisma Client
  - `prisma db push` — Syncs schema to database
  - `prisma db seed` — Runs seed script
  - SQLite database file: `server/prisma/dev.db`

---

## 8. Security Engineer

**Responsibilities:** Security Policy Design, Access Control Implementation, Security Testing

**What was done:**

- **Security Policy Document (`docs/security_policies.md`):**
  - Defined core security principle: strict read-only model
  - Documented authentication model: JWT, bcrypt (12 salt rounds), 1-hour token expiry
  - Defined authorization model: RBAC with student and faculty roles
  - Created data scoping rules table: who can see what data
  - Documented what is NOT stored: no sessions, no tokens in storage, no query logs

- **Defense-in-Depth Security Chain Design:**
  - Layer 1 — Rate Limiting: Three tiers (general 100/min, auth 5/min, chat 30/min)
  - Layer 2 — JWT Authentication: Stateless, token in memory only
  - Layer 3 — Role Guard: Factory pattern with allowed roles array
  - Layer 4 — ReadOnly Guard: Blocks POST/PUT/DELETE/PATCH on data routes
  - Layer 5 — Service Scoping: Every query filtered by `userId` from JWT
  - Layer 6 — AI Isolation: AI receives only pre-filtered data, never raw database access

- **ReadOnly Guard Implementation:**
  - Designed the principle: even if a developer accidentally creates a write endpoint, the guard blocks it
  - Applied selectively: data routes (yes), auth route (no, needs POST), chat route (no, needs POST)
  - Returns structured error with method + path for debugging

- **Write-Attempt Detection in Chat:**
  - Dual regex system: Arabic standalone patterns + English verb patterns
  - Arabic patterns use word boundaries `(^|[\s،.؟!])` to prevent false positives
  - Fixed critical bug: `معدلي` (GPA) was matching `عدل` (modify) — changed to standalone detection
  - 60+ patterns covering: delete, modify, add, register, cancel, upload, etc.

- **Tool-Calling Security Model:**
  - Designed the principle: "AI selection is advisory only" — the ToolExecutor re-validates role for every call
  - Registry only contains READ tools — no write tools can be registered
  - Cross-role attack prevention: student calling faculty tools -> FORBIDDEN
  - Unknown tool invocation: AI hallucinating a tool name -> TOOL_NOT_FOUND
  - Argument validation against JSON Schema before handler execution

- **Security Testing (within `server/tests/`):**
  - Middleware tests: all auth scenarios (valid, missing, expired, invalid token)
  - Role guard tests: correct role passes, wrong role blocked
  - ReadOnly guard tests: all HTTP methods tested
  - Tool executor tests: cross-role attack matrix
  - Pre-filter tests: write attempt detection accuracy

- **HTTP Security Headers:**
  - Helmet.js integration for security headers (XSS protection, content type sniffing prevention, etc.)
  - CORS restricted to configured origin (`localhost:5173` in dev)
  - Request body size limit: 1MB
  - Token stored in JavaScript memory only (not localStorage or cookies)

---

## Summary Table

| Role | Student | Key Deliverables |
|------|---------|-----------------|
| Project Manager | Student 1 | 6 docs, CLAUDE.md, architecture design, 17 decision records |
| AI Engineer | Student 1 + Student 4 | Gemini integration, tool-calling system, 9 tools, conversation memory |
| Backend Developer | Student 2 | Express server, 7 services, 7 controllers, 7 routes, auth system |
| Backend Developer | Student 3 | 5 middleware files, 245+ test cases, middleware chain |
| AI Engineer (NLP) | Student 4 | 400+ regex patterns, dialect support, intent detection, tool descriptions |
| Frontend Developer | Student 5 | 3 pages, routing, auth hook, API service layer |
| Frontend Developer | Student 6 | ChatWidget, 3 chat components, TailwindCSS theme, Vite config |
| Database Engineer | — | 9 models, seed script (300 students), deterministic PRNG |
| Security Engineer | — | Security policy, 6-layer defense, write detection, tool security model |
