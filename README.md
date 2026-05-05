# SARA — Smart Academic Read-Only Assistant

> مساعد أكاديمي ذكي يعمل بصلاحيات القراءة فقط — مشروع تخرج

**A lightweight AI chat widget for student portals. Ask academic questions in Arabic (including Saudi dialect) and get instant answers.**

---

## The Idea

SARA is an AI-powered chat widget that sits in the corner of any student portal. Instead of navigating through menus and pages, students and faculty can simply ask:

- "وش درجاتي؟" → Shows grades and GPA
- "كم غبت؟" → Shows absence records  
- "وش موادي الترم ذا؟" → Shows registered courses
- "عندي إنذارات؟" → Shows alerts and warnings
- "وش وضعي؟" → Full academic summary

The widget understands Saudi Arabic dialect natively.

---

## Core Principles

| Principle | Detail |
|-----------|--------|
| Read-Only | No data can be modified through the system |
| Backend-Enforced Auth | Backend is the sole authority on access control |
| AI = Interpreter Only | AI formats responses, never decides permissions |
| Role-Based Access | Each user sees only their own data |
| Swappable AI | Works with Gemini (free), OpenAI, or Ollama |

---

## Features

### Students
- Grades and GPA inquiry
- Absence records with warnings
- Class schedule
- Registered courses
- Academic plan (completed / in-progress / remaining)
- Alerts and notifications
- University news

### Faculty
- Their courses and enrolled student counts
- Students exceeding absence limits
- University news

### AI Chat Widget
- Natural language queries in Arabic / English
- Saudi dialect support (وش، ابي، عطني، كم)
- Smart intent detection (12 intent types)
- Graceful handling of unavailable features
- Fallback mode when AI provider is down
- Read-only enforcement with polite rejections

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| AI | Google Gemini API (free) / OpenAI / Ollama |
| Testing | Vitest + Supertest |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key (free): https://aistudio.google.com/app/apikey

### Installation

```bash
# 1. Backend
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev          # http://localhost:3000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev          # http://localhost:5173

# 3. Open browser → http://localhost:5173
```

### Environment Setup
Copy `.env.example` to `.env` and set:
```
JWT_SECRET=your-secret-here-min-32-chars
AI_PROVIDER=gemini
GEMINI_API_KEY=your-free-key-from-google
```

### Demo Accounts
| Role | Username | Password |
|------|----------|----------|
| Student | 441001 | student123 |
| Student | 441002 | student123 |
| Student | 441003 | student123 |
| Faculty | dr.omar | faculty123 |
| Faculty | dr.noura | faculty123 |

---

## Project Structure

```
smart-academic-assistant/
├── client/                     # React Frontend
│   └── src/
│       ├── pages/              # LoginPage, ChatPage, WidgetDemoPage
│       ├── components/         # ChatWidget, ChatMessage, TypingIndicator
│       ├── hooks/              # useAuth
│       └── services/           # api.js
├── server/                     # Express Backend
│   └── src/
│       ├── middleware/         # Auth, RoleGuard, ReadOnlyGuard, RateLimiter
│       ├── routes/            # 10 route files
│       ├── controllers/       # 9 controllers
│       ├── services/          # 8 services (scoped queries)
│       └── providers/         # AI abstraction (Gemini, OpenAI, Ollama)
│   └── prisma/                # Schema + seed data
│   └── tests/                 # 16 middleware tests
├── docs/                      # Full documentation
├── CLAUDE.md                  # AI context file
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/grades` | Student |
| GET | `/api/absences` | Student |
| GET | `/api/schedule` | Student |
| GET | `/api/plan` | Student |
| GET | `/api/alerts` | Student |
| GET | `/api/news` | All |
| GET | `/api/faculty/courses` | Faculty |
| GET | `/api/faculty/courses/:code/students` | Faculty |
| GET | `/api/faculty/absences/excessive` | Faculty |
| POST | `/api/chat` | All |

---

## Security

- All requests pass through JWT authentication middleware
- ReadOnlyGuard blocks any non-GET HTTP method on data routes
- AI has NO direct database access — receives only pre-filtered data
- Every query is scoped by role + owner
- Rate limiting on all endpoints
- Token stored in memory only (no localStorage)

---

## Future Work

- Email-based news ingestion (read university emails)
- PostgreSQL + Docker deployment
- Multi-university adapter pattern
- Integration/E2E tests
- Mobile-responsive widget optimization

---

## License

Academic graduation project — for educational use.
