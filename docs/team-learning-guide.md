# Team Learning Guide — SARA Project
## What Each Member Needs to Learn to Understand Their Work

---

## 1. Project Manager + AI Engineer (Student 1)

### For the Project Manager Role:

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| Software Development Life Cycle (SDLC) | Agile methodology, phased development, iterative delivery | The project was divided into 7 phases (0-6) with clear dependencies |
| System Architecture Design | Three-tier architecture, client-server model, separation of concerns | Designed the architecture: React -> Express -> Database + AI layer |
| Technical Documentation | Markdown writing, architecture diagrams, decision records (ADRs) | Created and maintained 6 documentation files + CLAUDE.md |
| API Design | REST API conventions, HTTP methods, endpoint naming, status codes | Defined 13 API endpoints with roles and methods |
| Project Coordination | Task decomposition, dependency management, role definition | Managed 8 roles with clear boundaries and integration points |

**Recommended Resources:**
- "Software Architecture Patterns" by Mark Richards (O'Reilly) — understanding three-tier architecture
- REST API design best practices (any tutorial covering HTTP methods, status codes, resource naming)
- Markdown Guide (commonmark.org) — for writing documentation

### For the AI Engineer Role:

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| LLM API Integration | Google Gemini API (generateContent endpoint), API keys, request/response format | Gemini is the primary AI provider (`gemini.provider.js`) |
| Function Calling / Tool Use | Gemini function calling: `functionDeclarations`, `functionCall`, `functionResponse` | Phase 6 uses Gemini's tool-calling to select and execute data tools |
| Prompt Engineering | System prompts, temperature/topP/topK settings, few-shot examples | `system-prompt.js` has two carefully crafted system prompts |
| Design Patterns — Factory | Factory pattern: one interface, multiple implementations, selected at runtime | `factory.js` selects Gemini/OpenAI/Ollama based on env variable |
| Design Patterns — Registry | Registry pattern: central map of named objects, lookup by key | `tool-registry.js` stores all 9 tools with name-based lookup |
| Design Patterns — Strategy | Strategy pattern: interchangeable algorithms behind common interface | Three AI providers implement the same `BaseAIProvider` interface |
| Regex (Regular Expressions) | Pattern syntax, character classes, alternation, flags (i, g), Unicode | 400+ regex patterns for intent detection and dialect matching |
| Conversation Memory | In-memory state management, TTL (time-to-live), sliding window | `conversation-memory.js` keeps 5 turns per user with 30-min expiry |

**Recommended Resources:**
- Google Gemini API docs: "Function calling" section — understanding `functionDeclarations` and tool-calling flow
- "Design Patterns: Elements of Reusable Object-Oriented Software" (Gang of Four) — Factory, Strategy, Registry patterns
- RegExr.com or regex101.com — interactive regex learning and testing
- OpenAI "Function Calling" guide (same concept as Gemini, good secondary reference)

---

## 2. Backend Developer (Student 2)

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| Node.js Fundamentals | Event loop, modules (ESM `import/export`), async/await, error handling | Entire backend is Node.js with ES Modules |
| Express.js | App creation, routing, middleware, `req`/`res`/`next`, error handling | `index.js` sets up Express with routes and middleware chain |
| REST API Development | HTTP methods (GET/POST), status codes (200/401/403/404/405/500), JSON responses | 13 endpoints with proper status codes and error messages |
| JWT Authentication | How JWT works: header.payload.signature, `jwt.sign()`, `jwt.verify()`, token expiry | Auth controller generates JWT, auth middleware verifies it |
| bcrypt Password Hashing | Hash functions, salt rounds, `bcrypt.hash()`, `bcrypt.compare()` | Passwords stored as bcrypt hashes with 12 salt rounds |
| Prisma ORM | Schema definition, `prisma.model.findMany()`, relations, `include`, `where`, `select` | All 7 services use Prisma to query SQLite database |
| SQL Concepts | SELECT, JOIN, WHERE, GROUP BY, aggregate functions, foreign keys | Understanding what Prisma generates underneath |
| Environment Variables | `dotenv`, `process.env`, configuration management | `config/index.js` reads from `.env` file |
| Middleware Pattern | What middleware is, `next()` function, execution order, error middleware | The middleware chain is the core security mechanism |

**Recommended Resources:**
- Express.js official guide (expressjs.com/en/guide) — routing, middleware, error handling
- Prisma "Getting Started" tutorial (prisma.io/docs/getting-started) — schema, queries, relations
- JWT.io — interactive JWT decoder and explanation
- "Node.js Design Patterns" by Mario Casciaro — middleware pattern, async patterns

---

## 3. Backend Developer (Student 3)

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| Express Middleware Deep Dive | Middleware execution order, `next()`, error middleware signature `(err, req, res, next)` | Built 5 middleware files that form the security chain |
| JWT (JSON Web Tokens) | Token structure, `jwt.verify()`, error types (`TokenExpiredError`, `JsonWebTokenError`) | Auth middleware handles valid, expired, and invalid tokens |
| RBAC (Role-Based Access Control) | Roles, permissions, role checks, principle of least privilege | Role guard uses factory function pattern with spread `...allowedRoles` |
| HTTP Methods & REST Security | GET vs POST vs PUT vs DELETE, idempotency, method-based access control | ReadOnly guard allows only GET/HEAD/OPTIONS |
| Rate Limiting | Token bucket algorithm, sliding window, `express-rate-limit` library | Three rate limit tiers for different endpoint categories |
| Unit Testing with Vitest | `describe`, `it`, `expect`, `vi.fn()`, `vi.mock()`, `beforeEach`, test structure | 245+ test cases using Vitest framework |
| Mocking | `vi.mock()` for module mocking, `vi.fn()` for function spying, mock implementations | Service mocks in test files to isolate middleware/tool testing |
| Test Design | Test case design: happy path, edge cases, error cases, security attack matrix | Cross-role attack tests verify student can't call faculty tools |
| Supertest | HTTP assertion library: `request(app).get('/path').expect(200)` | Integration tests send real HTTP requests to Express app |

**Recommended Resources:**
- Vitest documentation (vitest.dev) — test syntax, mocking, configuration
- "Testing Node.js Applications" — patterns for middleware testing
- OWASP RBAC guide — understanding role-based access control principles
- `express-rate-limit` npm docs — configuration options and algorithms

---

## 4. AI Engineer (Student 4)

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| Natural Language Processing (NLP) Basics | Tokenization, pattern matching, intent detection, keyword extraction | Intent detection engine uses regex-based NLP |
| Regular Expressions (Advanced) | Unicode character classes, Arabic regex, word boundaries, lookahead/lookbehind, alternation groups | 400+ regex patterns covering Arabic, dialect, and English |
| Arabic Language Processing | Arabic script, taa marbuta (ة) vs taa (ت), hamza variations, Arabic word boundaries | Dialect patterns handle multiple Arabic script variations |
| Saudi Arabic Dialect | Common Saudi expressions: وش (what), ابي (I want), عطني (give me), وريني (show me), كم (how many) | Core UX requirement: understanding Saudi dialect input |
| Prompt Engineering (Advanced) | Tool disambiguation in prompts, keyword-to-tool mapping, few-shot examples in system prompts | Tool descriptions contain dialect examples to help Gemini choose correctly |
| LLM Behavior Debugging | When LLM ignores tool calls, returns text instead, confuses similar tools | Fixed Gemini confusion between absences and grades via description engineering |
| Intent Classification | Multi-class classification, priority ordering, role-based filtering, fallback handling | 11 intent categories with priority ordering and role restrictions |
| Testing AI Systems | Non-deterministic testing strategies, live testing vs unit testing, rate limit handling | Live test scripts (`live-focused-test.mjs`) test real Gemini responses |

**Recommended Resources:**
- "Speech and Language Processing" by Jurafsky & Martin (Chapter on regex and text normalization) — free online
- Arabic NLP resources: CAMeL Tools documentation, Arabic regex guides
- Google Gemini function calling docs — understanding how tool descriptions affect model selection
- regex101.com with "ECMAScript" flavor — for testing JavaScript regex patterns
- Saudi dialect reference: any Saudi Arabic phrasebook or dialect guide

---

## 5. Frontend Developer (Student 5)

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| React 18 Fundamentals | Components, JSX, props, state (`useState`), effects (`useEffect`), hooks | All frontend components are React functional components |
| React Router v6 | `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate` | App.jsx sets up routing with protected/public route wrappers |
| React Context API | `createContext`, `useContext`, `Provider` pattern | Auth state shared via `AuthProvider` context |
| Custom Hooks | Creating hooks (`useAuth`), encapsulating state logic, returning API | `useAuth.jsx` provides login/logout/user/error to all components |
| HTTP Requests in React | `fetch` API or Axios, async/await in event handlers, error handling | `api.js` service layer handles all API communication |
| Authentication Flow (Frontend) | Token storage, auth headers, protected routes, logout cleanup | Token stored in memory, injected as Bearer header |
| Vite Build Tool | `vite.config.js`, dev server, proxy configuration, React plugin | Vite proxy forwards `/api/*` to Express backend on port 3001 |
| Basic CSS/Tailwind | Utility classes, responsive design, flexbox, grid | Pages use TailwindCSS for styling |

**Recommended Resources:**
- React official docs (react.dev) — "Learn React" tutorial, especially Hooks and Context sections
- React Router v6 docs (reactrouter.com) — route protection patterns
- Vite docs (vite.dev) — proxy configuration for API calls
- "The Joy of React" by Josh Comeau — modern React patterns with hooks

---

## 6. Frontend Developer (Student 6)

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| React Component Design | Component composition, props, conditional rendering, list rendering with `.map()` | ChatWidget has 5 sub-components with conditional rendering |
| React State Management | `useState` for multiple states, state lifting, derived state | ChatWidget manages 10+ state variables (messages, input, isOpen, isTyping, etc.) |
| React Refs | `useRef` for DOM access, `scrollIntoView`, input focus management | Auto-scroll to bottom, auto-focus on input when widget opens |
| Event Handling in React | `onSubmit`, `onChange`, `onKeyDown`, `e.preventDefault()`, keyboard shortcuts | Enter-to-send, Shift+Enter for newline, form submission |
| TailwindCSS | Utility-first CSS, custom colors, responsive classes, transitions, animations | Entire UI styled with Tailwind: `bg-sara-600`, `hover:bg-sara-700`, etc. |
| CSS Layout | Flexbox (`flex`, `flex-col`, `items-center`, `justify-between`), fixed positioning, z-index | Widget uses fixed positioning and z-index 9999 for floating overlay |
| RTL (Right-to-Left) Support | `direction: rtl`, `dir="ltr"` for inputs, bidirectional text | Widget container is RTL, but inputs are LTR for English/numbers |
| SVG Icons | Inline SVG in JSX, `viewBox`, `stroke`, `fill`, `strokeWidth` | All icons are inline SVGs (chat bubble, lock, send arrow, graduation cap) |
| CSS Animations | Tailwind transitions (`transition-all`, `hover:scale-105`), custom keyframes | Typing indicator dots bounce, send button scales on click |
| Responsive Design | `max-h-[80vh]`, viewport-relative units, mobile-first design | Widget adapts to screen size |

**Recommended Resources:**
- TailwindCSS docs (tailwindcss.com/docs) — utility class reference, customization
- "Every Layout" by Andy Bell & Heydon Pickering — CSS layout patterns
- MDN Web Docs: Flexbox guide, CSS transitions, SVG tutorial
- Heroicons (heroicons.com) — the SVG icon set used in the project

---

## 7. Database Engineer

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| Relational Database Design | Tables, columns, data types, primary keys, foreign keys, unique constraints | 9 models with relationships and constraints |
| Database Normalization | 1NF, 2NF, 3NF, avoiding data redundancy, proper relationship design | Enrollment table normalizes many-to-many between Student and Course |
| Entity-Relationship Modeling | ER diagrams, one-to-many, many-to-many, relationship cardinality | User->Course (faculty), User<->Course via Enrollment (student) |
| Prisma ORM | Schema syntax (`model`, `@id`, `@unique`, `@relation`, `@map`, `@@map`, `@default`) | Schema defines all models, relations, and database mappings |
| SQLite | File-based database, SQLite-specific constraints, no concurrent writes | Development database is SQLite (`dev.db`) |
| PostgreSQL Basics | Production database, connection strings, differences from SQLite | Production target is PostgreSQL |
| Seed Scripts | Test data generation, deterministic randomness (PRNG), realistic distributions | `seed.js` generates 300 students with realistic grades, absences, names |
| PRNG (Pseudorandom Number Generator) | Seed-based randomness, `mulberry32` algorithm, deterministic vs random | `mulberry32(42)` ensures same data every run |
| Data Distribution Design | Grade curves (A+ 5% to F 10%), absence profiles (80% low, 15% medium, 5% high) | Realistic data distributions for meaningful demo |
| Batch Operations | Chunked inserts, foreign key order (create parents before children), cascade deletes | SQLite has limits on batch size; seed inserts in chunks of 100 |
| Database Migrations | `prisma db push`, `prisma migrate`, schema evolution | Syncing schema changes to database |

**Recommended Resources:**
- Prisma official docs (prisma.io/docs) — schema reference, relations, seeding
- "Database Design for Mere Mortals" by Michael Hernandez — relational design fundamentals
- SQLite documentation (sqlite.org/docs.html) — constraints and limitations
- Any university "Database Systems" course notes (ER diagrams, normalization)

---

## 8. Security Engineer

| Topic | What to Study | Why It's Needed |
|-------|--------------|-----------------|
| OWASP Top 10 | Injection, broken auth, sensitive data exposure, broken access control | Security policy addresses multiple OWASP categories |
| Defense-in-Depth | Multiple security layers, each layer independent, no single point of failure | 6-layer security chain: rate limit -> auth -> role -> readOnly -> scoping -> AI isolation |
| Authentication Security | JWT security best practices, token storage (memory vs localStorage), token expiry, bcrypt | JWT tokens stored in memory only, bcrypt with 12 rounds |
| Authorization & RBAC | Role-based access control, principle of least privilege, permission matrices | Two roles (student/faculty) with strict data scoping |
| Rate Limiting | Token bucket algorithm, per-endpoint rate limits, brute force prevention | Three rate limit tiers protecting different attack surfaces |
| Input Validation | Regex-based validation, allowlisting vs denylisting, Arabic text validation | Write-attempt detection with 60+ patterns in two languages |
| HTTP Security Headers | Helmet.js, Content-Security-Policy, X-Frame-Options, HSTS | `app.use(helmet())` sets security headers automatically |
| CORS (Cross-Origin Resource Sharing) | Origin restriction, credentials mode, preflight requests | CORS restricted to `localhost:5173` in development |
| API Security | Read-only enforcement, method allowlisting, structured error responses | ReadOnly guard blocks non-GET methods on data routes |
| AI Security | Prompt injection prevention, AI isolation, data filtering before AI | AI never accesses database directly; receives only pre-filtered data |
| Security Testing | Attack matrix testing, boundary testing, negative testing | Cross-role attack tests: student invoking faculty tools -> FORBIDDEN |
| Threat Modeling | Identifying attack surfaces, trust boundaries, data flow analysis | Documented security boundaries in `security_policies.md` |

**Recommended Resources:**
- OWASP Top 10 (owasp.org/www-project-top-ten) — essential web security vulnerabilities
- "Web Application Security" by Andrew Hoffman (O'Reilly) — practical web security
- JWT security best practices (auth0.com/blog/jwt-security-best-practices)
- Helmet.js docs (helmetjs.github.io) — understanding each security header
- OWASP Testing Guide — security testing methodologies
- "The Web Application Hacker's Handbook" by Stuttard & Pinto — understanding attack surfaces

---

## Quick Reference: Shared Technologies Everyone Should Know

| Technology | Used By | Minimum Understanding Needed |
|-----------|---------|------------------------------|
| JavaScript (ES2022+) | Everyone | `async/await`, `import/export`, arrow functions, destructuring, template literals |
| Git | Everyone | `git add`, `commit`, `push`, `pull`, `branch`, `merge`, `.gitignore` |
| npm | Everyone | `npm install`, `npm run`, `package.json` scripts, `node_modules` |
| JSON | Everyone | Object/array syntax, parsing, `JSON.stringify`/`JSON.parse` |
| Terminal / Command Line | Everyone | `cd`, `ls`, `mkdir`, `node`, `npm`, environment variables |
| REST API Concepts | Everyone | HTTP methods, status codes, request/response, headers, JSON body |
| `.env` Files | Backend + AI | Environment variables, secrets management, `.env.example` pattern |
