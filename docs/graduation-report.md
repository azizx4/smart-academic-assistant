# SARA — Smart Academic Read-Only Assistant

## Graduation Project Report

---

**University:** [University Name]

**College:** [College Name]

**Department:** [Department Name]

**Supervisor:** [Dr. Full Name]

**Academic Year:** 2025–2026

---

### Team Members

| # | Name | Student ID | Role |
|---|------|-----------|------|
| 1 | [Student Name] | [ID] | Project Manager + AI Engineer |
| 2 | [Student Name] | [ID] | Backend Developer |
| 3 | [Student Name] | [ID] | Backend Developer + QA |
| 4 | [Student Name] | [ID] | AI Engineer (NLP Specialist) |
| 5 | [Student Name] | [ID] | Frontend Developer |
| 6 | [Student Name] | [ID] | Frontend Developer |

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Project Objectives](#4-project-objectives)
5. [Literature Review](#5-literature-review)
6. [System Requirements](#6-system-requirements)
7. [System Architecture](#7-system-architecture)
8. [Technology Stack](#8-technology-stack)
9. [Database Design](#9-database-design)
10. [Backend Implementation](#10-backend-implementation)
11. [AI Engine & Natural Language Processing](#11-ai-engine--natural-language-processing)
12. [Tool-Calling Architecture](#12-tool-calling-architecture)
13. [Security Model](#13-security-model)
14. [Frontend Implementation](#14-frontend-implementation)
15. [Testing & Quality Assurance](#15-testing--quality-assurance)
16. [Demo Scenarios & Results](#16-demo-scenarios--results)
17. [Team Contributions](#17-team-contributions)
18. [Challenges & Solutions](#18-challenges--solutions)
19. [Future Work](#19-future-work)
20. [Conclusion](#20-conclusion)
21. [References](#21-references)
22. [Appendices](#22-appendices)

---

## 1. Abstract

SARA (Smart Academic Read-Only Assistant) is a secure, AI-powered academic chatbot designed for university environments. The system provides students and faculty with instant access to their academic data — grades, absences, schedules, academic plans, and more — through a natural language chat interface.

Unlike general-purpose AI chatbots, SARA operates under strict security constraints: it enforces read-only access to academic data, implements role-based access control at the backend level, and ensures that the AI model never makes authorization decisions. The system understands three language registers: formal Arabic, Saudi Arabic dialect, and English — making it accessible to a diverse user base.

The project introduces a tool-calling architecture where the AI selects from registered academic tools (e.g., grades lookup, absence analysis), and the backend independently validates and executes each tool call. This design ensures that even if the AI makes an incorrect selection, the system's security guarantees remain intact.

SARA was built using React, Express.js, Prisma ORM, and Google Gemini, with a dataset of 300 students, 30 faculty members, and 20 courses. The system includes 245+ automated tests covering middleware, tool execution, cross-role attack prevention, and chat flow integration.

**Keywords:** Academic Chatbot, Natural Language Processing, Role-Based Access Control, Read-Only Architecture, AI Tool Calling, Saudi Arabic Dialect, Function Calling

---

## 2. Introduction

### 2.1 Background

University students frequently need to check their academic information — grades, absences, schedules, and alerts. Traditional university portals such as PeopleSoft and Student Information Systems (SIS) require students to navigate complex menus and understand the system's structure to find simple information. This creates a barrier, especially for students who are not technically proficient or who simply want a quick answer to a straightforward question like "Am I at risk of denial in any course?"

The rise of AI-powered chatbots has transformed how users interact with information systems. Platforms like ChatGPT and Google Gemini have demonstrated that natural language interfaces can dramatically reduce the cognitive load of information retrieval. However, applying these technologies to university academic data introduces critical challenges:

1. **Data Security**: Academic records are sensitive personal data protected by university policies and privacy regulations.
2. **Access Control**: A student should only see their own data, and a faculty member should only see data for their assigned courses.
3. **Read-Only Integrity**: An AI chatbot must never modify academic records, even accidentally.
4. **Language Diversity**: In Saudi universities, students communicate in formal Arabic, Saudi dialect, and English — often within the same conversation.

### 2.2 Project Scope

SARA is designed as a proof-of-concept that demonstrates how AI can be safely integrated into academic information systems. It is not intended to replace existing university portals, but rather to complement them by providing a lightweight, embeddable chat widget that can sit in the corner of any existing student portal.

The project focuses on:
- Secure, read-only access to academic data
- Role-based data scoping (student vs. faculty)
- AI-powered natural language understanding with Saudi dialect support
- A clean, modern chat interface
- Comprehensive testing and security validation

### 2.3 Report Organization

This report is organized into 22 sections covering the full lifecycle of the project: from problem identification and requirements analysis, through system architecture and implementation, to testing, demo scenarios, and future work. Each section includes technical details, design rationale, and references to specific files in the codebase.

---

## 3. Problem Statement

### 3.1 Current Challenges

Students and faculty at Saudi universities face several challenges when accessing academic information:

1. **Complex Navigation**: Existing portals require multiple clicks and page navigations to find simple information. A student checking their GPA must navigate to the grades section, select the semester, and mentally calculate their standing.

2. **No Natural Language Interface**: Students cannot ask questions in their own words. They must understand the portal's menu structure and terminology.

3. **No Arabic Dialect Support**: While portals may support formal Arabic, they do not understand Saudi dialect expressions like "وش درجاتي" (What are my grades?) or "كم غبت" (How many absences do I have?).

4. **No Proactive Analysis**: Existing systems display raw data without analysis. A student must manually check each course's absence count against the denial threshold — the system does not flag risk.

5. **Faculty Overhead**: Faculty members who want to identify at-risk students must manually review each student's record across all their courses.

### 3.2 The Gap

While AI chatbots like ChatGPT can understand natural language, they cannot:
- Access university databases
- Enforce role-based access control
- Guarantee read-only behavior
- Understand Saudi dialect in the context of academic terminology

SARA bridges this gap by combining AI natural language understanding with a secure, role-based backend that controls all data access.

### 3.3 Research Questions

1. How can an AI chatbot be integrated with academic data while maintaining strict read-only access?
2. How can role-based access control be enforced independently of AI decision-making?
3. How can Saudi Arabic dialect be supported in academic intent detection?
4. How can the system maintain availability when the AI service is unavailable or rate-limited?

---

## 4. Project Objectives

### 4.1 Primary Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | Build a secure, read-only AI academic assistant | No write/update/delete endpoints on academic data; ReadOnly guard blocks all non-GET methods |
| 2 | Enforce role-based access at the backend level | Student cannot access faculty tools; faculty cannot access other faculty's data; tests prove cross-role attacks fail |
| 3 | Separate AI reasoning from authorization | AI selects tools, backend validates — AI hallucination cannot bypass access control |
| 4 | Support Saudi Arabic dialect | 400+ regex patterns covering formal Arabic, Saudi dialect, and English across 11 intents |
| 5 | Provide smart data analysis | Risk assessment for absences, failure detection for grades, progress tracking for academic plans |
| 6 | Build a modern, embeddable chat interface | Floating widget with responsive design, typing indicators, quick actions |

### 4.2 Secondary Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 7 | Support swappable AI providers | Provider abstraction allows switching between Gemini, OpenAI, and Ollama via environment variable |
| 8 | Implement comprehensive testing | 245+ automated tests covering middleware, tools, chat flow, and security |
| 9 | Build a realistic dataset | 300 students, 30 faculty, 20 courses with realistic grade distributions and absence profiles |
| 10 | Implement fallback when AI is unavailable | Legacy keyword flow automatically activates when AI service fails |

---

## 5. Literature Review

### 5.1 AI Chatbots in Education

AI-powered chatbots have been increasingly adopted in educational settings. Research by Wollny et al. (2021) identified several categories of educational chatbots: tutoring bots, administrative bots, and FAQ bots. SARA falls into the administrative category — it helps users access existing information rather than teaching new concepts.

A key finding in the literature is that chatbots in education must be designed with clear boundaries. Smutny and Schreiberova (2020) noted that chatbots which attempt to do too much often confuse users. SARA addresses this by having a well-defined scope: academic data retrieval only, with clear responses for out-of-scope requests.

### 5.2 Security in AI Systems

The concept of "AI != Authorizer" is central to SARA's design and aligns with the principle of least privilege (Saltzer and Schroeder, 1975). In SARA, the AI model never decides who can see what data — this decision is made by the backend middleware chain before any data reaches the AI.

This approach is consistent with the defense-in-depth security model (NIST, 2020), where multiple independent layers of security ensure that a failure in one layer does not compromise the system. SARA implements six security layers, from rate limiting at the perimeter to AI isolation at the core.

### 5.3 Natural Language Understanding for Arabic

Arabic NLP presents unique challenges due to the language's morphological complexity and the significant gap between Modern Standard Arabic (MSA) and regional dialects (Habash, 2010). Saudi Arabic dialect differs from MSA in vocabulary, grammar, and pronunciation — for example, "what" is "ما" in MSA but "وش" or "ايش" in Saudi dialect.

SARA addresses this through a dual approach: regex-based pattern matching for the legacy/fallback system (400+ patterns), and AI-based understanding through Google Gemini for the primary path. The regex patterns were manually crafted to cover three registers (formal Arabic, Saudi dialect, English) for each of the 11 supported intents.

### 5.4 Function Calling in Large Language Models

Function calling (also known as tool use) is a capability where an LLM selects and parameterizes functions from a provided schema, rather than generating free-form text. Google Gemini, OpenAI GPT-4, and Anthropic Claude all support this capability.

SARA uses function calling to bridge the gap between natural language and structured data retrieval. When a user asks "Am I at risk of denial?", the AI selects the `get_student_absences` tool with the appropriate parameters, and the backend executes the tool after validating the user's role and permissions.

### 5.5 Related Systems

| System | Similarity to SARA | Key Difference |
|--------|-------------------|----------------|
| ChatGPT | Natural language interface | No access to university data, no role-based access |
| University Chatbots (FAQ) | Academic domain | Rule-based, no data access, no dialect support |
| PeopleSoft | Academic data access | No natural language, no AI, complex navigation |
| Google Bard/Gemini | AI understanding | General-purpose, no access control, no academic data |

SARA combines the natural language capability of AI chatbots with the data access of university portals and the security of enterprise access control systems.

---

## 6. System Requirements

### 6.1 Functional Requirements

#### 6.1.1 Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Users must log in with username and password | High |
| FR-02 | System must issue JWT tokens upon successful login | High |
| FR-03 | System must support two roles: student and faculty | High |
| FR-04 | Students can only access their own academic data | High |
| FR-05 | Faculty can only access data for their assigned courses | High |

#### 6.1.2 Student Features

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-06 | Students can view their grades and GPA | High |
| FR-07 | Students can view their absences per course | High |
| FR-08 | Students can view their weekly schedule | High |
| FR-09 | Students can view their academic plan (degree progress) | Medium |
| FR-10 | Students can view their alerts and notifications | Medium |
| FR-11 | Students can view university news | Low |

#### 6.1.3 Faculty Features

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12 | Faculty can view their assigned courses with enrollment counts | High |
| FR-13 | Faculty can view student rosters for their courses | High |
| FR-14 | Faculty can view students with excessive absences | High |
| FR-15 | Faculty can view university news | Low |

#### 6.1.4 Chat Interface

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-16 | Users can ask questions in natural language | High |
| FR-17 | System must understand Arabic, Saudi dialect, and English | High |
| FR-18 | System must call multiple tools in one response when needed | Medium |
| FR-19 | System must reject write/modification attempts with clear message | High |
| FR-20 | System must respond for out-of-scope questions with clear message | Medium |

### 6.2 Non-Functional Requirements

| ID | Requirement | Category |
|----|-------------|----------|
| NFR-01 | All academic data endpoints must be read-only (GET only) | Security |
| NFR-02 | AI model must never make authorization decisions | Security |
| NFR-03 | System must have fallback when AI service is unavailable | Reliability |
| NFR-04 | Response time under 5 seconds for chat queries | Performance |
| NFR-05 | Rate limiting: 100 req/min general, 5/min auth, 30/min chat | Security |
| NFR-06 | System must work with 300+ students and 30+ faculty | Scalability |
| NFR-07 | AI provider must be swappable without code changes | Maintainability |
| NFR-08 | System must have 200+ automated tests | Quality |

---

## 7. System Architecture

### 7.1 Overview

SARA follows a three-tier architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React)                     │
│  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │  ChatWidget   │  │      Portal UI (Demo)       │  │
│  │  (floating)   │  │  Simulated Student Portal   │  │
│  └──────┬───────┘  └──────────┬──────────────────┘  │
│         └──────────┬──────────┘                      │
│                    │ API calls (/api/*)               │
└────────────────────┼─────────────────────────────────┘
                     │ HTTP (JSON)
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
│  │    Gemini / OpenAI / Ollama (swappable)          │  │
│  │    Receives ONLY pre-filtered data               │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────┐
│            DATABASE (Prisma ORM)                      │
│                  SQLite                                │
│                                                       │
│  Users, Courses, Enrollments, Grades, Absences,       │
│  Schedules, AcademicPlans, Alerts, News               │
└──────────────────────────────────────────────────────┘
```

> [INSERT DIAGRAM: architecture-diagram.png — a clean visual version of the above]

### 7.2 Data Flow — Chat Request

The following diagram illustrates the complete data flow when a user sends a chat message:

```
User types message
       │
       ▼
POST /api/chat (with JWT token)
       │
       ▼
┌──────────────┐
│ Rate Limiter  │──→ 429 Too Many Requests
└──────┬───────┘
       ▼
┌──────────────┐
│ Auth (JWT)    │──→ 401 Unauthorized
└──────┬───────┘
       ▼
┌──────────────┐
│ Chat Service  │
└──────┬───────┘
       ▼
┌──────────────────┐
│ Pre-filter check  │
│ (greeting/help/   │──→ Canned response (no AI call)
│  write/unavail)   │
└──────┬───────────┘
       ▼ (not canned)
┌──────────────────┐
│ AI Provider       │
│ supportsTools()?  │
└──────┬───────────┘
    ┌──┴──┐
   YES    NO
    │      │
    ▼      ▼
┌────────┐ ┌────────────┐
│selectTool│ │Legacy Flow │
│(Gemini)  │ │(keywords)  │
└────┬───┘ └─────┬──────┘
     ▼           ▼
┌──────────┐ ┌──────────┐
│executeTool│ │fetchData  │
│(validated)│ │(scoped)   │
└────┬─────┘ └─────┬────┘
     ▼              ▼
┌───────────────┐ ┌──────────┐
│respondWithTool│ │AI format  │
│Results(Gemini)│ │or fallback│
└───────┬───────┘ └─────┬────┘
        └───────┬───────┘
                ▼
         Response to user
```

> [INSERT DIAGRAM: data-flow-diagram.png]

### 7.3 Security Architecture

SARA implements a six-layer defense-in-depth security model:

```
                    REQUEST
                       │
        ┌──────────────▼──────────────┐
Layer 1 │      Rate Limiter           │  Prevents brute force & abuse
        └──────────────┬──────────────┘
        ┌──────────────▼──────────────┐
Layer 2 │   JWT Authentication        │  Verifies identity
        └──────────────┬──────────────┘
        ┌──────────────▼──────────────┐
Layer 3 │      Role Guard             │  Checks student vs faculty
        └──────────────┬──────────────┘
        ┌──────────────▼──────────────┐
Layer 4 │    ReadOnly Guard           │  Blocks POST/PUT/DELETE/PATCH
        └──────────────┬──────────────┘
        ┌──────────────▼──────────────┐
Layer 5 │   Service Scoping           │  Queries filtered by userId
        └──────────────┬──────────────┘
        ┌──────────────▼──────────────┐
Layer 6 │    AI Isolation             │  AI sees only filtered data
        └──────────────┬──────────────┘
                       │
                   RESPONSE
```

> [INSERT DIAGRAM: security-layers.png]

### 7.4 AI Provider Pattern

The AI provider follows the Factory design pattern, allowing the system to swap between providers without code changes:

```
BaseAIProvider (abstract)
  │
  ├── GeminiProvider   → Google Gemini API
  │     ├── generateResponse()
  │     ├── selectTool()
  │     └── respondWithToolResults()
  │
  ├── OpenAIProvider   → OpenAI GPT-4
  │     └── generateResponse()
  │
  └── OllamaProvider   → Local Ollama
        └── generateResponse()
```

Switching providers requires only changing the `AI_PROVIDER` environment variable (e.g., `gemini`, `openai`, `ollama`).

---

## 8. Technology Stack

### 8.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI component framework |
| Vite | 6.x | Build tool and dev server |
| TailwindCSS | 3.x | Utility-first CSS framework |
| React Router | 6.x | Client-side routing |
| Axios / Fetch | — | HTTP client for API calls |

**Why React + Vite:** React provides a component-based architecture ideal for building the chat interface. Vite offers fast development builds with Hot Module Replacement (HMR), significantly improving development speed compared to traditional bundlers like Webpack.

**Why TailwindCSS:** Tailwind's utility classes enable rapid UI development without writing custom CSS files. The custom color palette (`sara-50` through `sara-900`) provides consistent branding across all components.

### 8.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x+ | JavaScript runtime |
| Express | 4.x | HTTP framework |
| Prisma | 5.x | ORM for database access |
| jsonwebtoken | 9.x | JWT token generation and verification |
| bcrypt | 5.x | Password hashing (12 salt rounds) |
| Helmet | 7.x | HTTP security headers |
| cors | 2.x | Cross-Origin Resource Sharing |

**Why Express:** Express is the most widely-used Node.js web framework, with a mature ecosystem and extensive middleware support. Its middleware chain pattern maps directly to SARA's security requirements.

**Why Prisma:** Prisma provides type-safe database access with auto-generated client code. It supports multiple database backends (SQLite, PostgreSQL, MySQL) through a single schema definition, which aligns with SARA's requirement for flexible deployment.

### 8.3 Database

| Technology | Purpose |
|-----------|---------|
| SQLite | Development database — zero configuration |
| Prisma Schema | 9 models with relationships |
| Prisma Seed | Deterministic dataset generation |

**Why SQLite:** For a development and demonstration environment, SQLite requires zero configuration — no database server to install or manage. The database is a single file (`dev.db`), making it easy to reset and reproduce.

### 8.4 AI

| Technology | Purpose |
|-----------|---------|
| Google Gemini 2.5 Flash | Primary AI provider with function calling |
| OpenAI GPT-4o-mini | Alternative provider |
| Ollama (Llama 3.2) | Local alternative (no API key needed) |

**Why Gemini:** Google Gemini offers a free tier with function calling support — essential for the tool-calling architecture. The free tier provides sufficient capacity for development and demonstration.

### 8.5 Testing

| Technology | Purpose |
|-----------|---------|
| Vitest | Unit and integration test runner |
| Supertest | HTTP-level API testing |

---

## 9. Database Design

### 9.1 Entity-Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│  Enrollment  │──N:1──│  Course   │
│          │       └──────────────┘       │          │
│ id       │                               │ code     │
│ username │       ┌──────────────┐       │ nameAr   │
│ password │──1:N──│    Grade     │──N:1──│ nameEn   │
│ role     │       └──────────────┘       │ creditHrs│
│ nameAr   │                               │ facultyId│──→ User
│ nameEn   │       ┌──────────────┐       └──────────┘
│          │──1:N──│   Absence    │──N:1──┐
│          │       └──────────────┘       │
│          │                               │
│          │       ┌──────────────┐       │
│          │──1:N──│  Schedule    │──N:1──┘
│          │       └──────────────┘
│          │
│          │       ┌──────────────┐
│          │──1:N──│ AcademicPlan │
│          │       └──────────────┘
│          │
│          │       ┌──────────────┐
│          │──1:N──│    Alert     │
│          │       └──────────────┘
│          │
│          │       ┌──────────────┐
│          │       │    News      │  (no user relation — public)
│          │       └──────────────┘
└──────────┘
```

> [INSERT DIAGRAM: er-diagram.png]

### 9.2 Model Details

#### User Model
```
User {
  id          Int       @id @default(autoincrement())
  username    String    @unique
  passwordHash String
  role        String    // "student" or "faculty"
  nameAr      String
  nameEn      String
  email       String?
  createdAt   DateTime  @default(now())
}
```

#### Course Model
```
Course {
  code        String    @id
  nameAr      String
  nameEn      String
  creditHrs   Int       @default(3)
  semester    String
  facultyId   Int       // → User (faculty)
}
```

#### Grade Model
```
Grade {
  id          Int       @id @default(autoincrement())
  studentId   Int       // → User (student)
  courseId     String    // → Course
  midterm     Float
  final       Float
  assignments Float
  total       Float
  letterGrade String    // A+, A, B+, B, C+, C, D+, D, F
}
```

#### Absence Model
```
Absence {
  id          Int       @id @default(autoincrement())
  studentId   Int       // → User (student)
  courseId     String    // → Course
  date        DateTime
  reason      String?
}
```

### 9.3 Seed Data

The seed script generates a realistic university dataset using a deterministic pseudo-random number generator (PRNG):

| Entity | Count | Details |
|--------|-------|---------|
| Students | 300 | IDs 441001–441300, realistic Saudi names |
| Faculty | 30 | 18 male + 10 female + 2 original test accounts |
| Courses | 20 | Across 8 departments (CS, IS, MATH, PHYS, ENG, STAT, SE, NET) |
| Grades | ~1,500 | Realistic distribution: A+ 5%, A 10%, ... F 10% |
| Absences | ~1,200 | 80% low (0–2), 15% medium (3–4), 5% high (5–8) |
| Schedules | ~100 | Weekly timetable entries with rooms |
| Academic Plans | ~3,000 | Per-student degree plans with status |
| Alerts | ~400 | Auto-generated from actual absence/grade data |
| News | 10 | Bilingual announcements, competitions, events |

**Deterministic PRNG:** The `mulberry32(42)` function generates the same random numbers every run, ensuring the dataset is reproducible. Running `npm run seed` always produces identical data.

**Realistic Grade Distribution:**
```
A+: 5%  → 4.0 GPA points
A:  10% → 4.0
B+: 15% → 3.5
B:  20% → 3.0
C+: 20% → 2.5
C:  15% → 2.0
D+: 5%  → 1.5
D:  5%  → 1.0
F:  10% → 0.0
```

**Auto-Generated Alerts:** Alerts are not randomly generated — they are derived from actual data:
- Warning when a student has 3+ absences in a course
- Urgent alert when a student has 5+ absences (denial risk)
- Grade warning when a course total is below 60
- Final exam reminder for all students

---

## 10. Backend Implementation

### 10.1 Server Setup

The Express server (`server/src/index.js`, 113 lines) initializes with the following configuration:

- **Security Headers:** Helmet.js for XSS protection, content-type sniffing prevention
- **CORS:** Restricted to configured origin (`localhost:5173` in development)
- **Body Limit:** 1MB maximum request body
- **JSON Parsing:** Express built-in JSON parser

### 10.2 Middleware Chain

Every request passes through a middleware chain. The order is critical:

```
Request → RateLimiter → AuthMiddleware → RoleGuard → ReadOnlyGuard → Controller
```

#### Rate Limiter (`server/src/middleware/rate-limiter.js`)
Three tiers to protect different attack surfaces:

| Tier | Limit | Window | Purpose |
|------|-------|--------|---------|
| General | 100 requests | 1 minute | General abuse prevention |
| Auth | 5 attempts | 1 minute | Brute force protection |
| Chat | 30 messages | 1 minute | AI quota protection |

#### Auth Middleware (`server/src/middleware/auth.middleware.js`)
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and expiry using `jsonwebtoken`
- Attaches decoded `{ id, username, role }` to `req.user`
- Returns bilingual error messages (Arabic + English) for:
  - Missing token → "Unauthorized — please log in"
  - Expired token → "Session expired — please log in again"
  - Invalid token → "Invalid token"

#### Role Guard (`server/src/middleware/role.guard.js`)
- Factory function pattern: `roleGuard("student")` or `roleGuard("student", "faculty")`
- Checks `req.user.role` against the allowed roles array
- Returns 403 with `requiredRoles` and `yourRole` for debugging

#### ReadOnly Guard (`server/src/middleware/readonly.guard.js`)
- Allows only GET, HEAD, and OPTIONS methods
- Returns 405 Method Not Allowed for POST, PUT, DELETE, PATCH
- Applied to all data routes but NOT to auth (needs POST for login) or chat (needs POST for messages)

### 10.3 API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/login` | No | Public | Login with username/password |
| GET | `/api/auth/me` | Yes | Any | Get current user profile |
| GET | `/api/grades` | Yes | Student | View own grades + GPA |
| GET | `/api/absences` | Yes | Student | View own absences |
| GET | `/api/schedule` | Yes | Student | View own schedule |
| GET | `/api/plan` | Yes | Student | View academic plan |
| GET | `/api/alerts` | Yes | Student | View alerts |
| GET | `/api/news` | Yes | Any | View university news |
| GET | `/api/faculty/courses` | Yes | Faculty | View assigned courses |
| GET | `/api/faculty/courses/:code/students` | Yes | Faculty | View course roster |
| GET | `/api/faculty/absences/excessive` | Yes | Faculty | View at-risk students |
| POST | `/api/chat` | Yes | Any | Send chat message |
| GET | `/api/health` | No | Public | Health check |

### 10.4 Service Layer

Each service implements scoped queries — every database query is filtered by the authenticated user's ID:

```javascript
// Example: getStudentGrades — always scoped to the authenticated user
async function getStudentGrades(userId) {
  return prisma.grade.findMany({
    where: {
      enrollment: { studentId: userId }  // ← scoped by userId
    },
    include: { course: true }
  });
}
```

**This scoping is enforced at the service level, not at the AI level.** Even if the AI were to request data for a different user, the service would only return data for the authenticated user.

Services implemented:
- `grade.service.js` — `getStudentGrades()`, `getStudentGPA()` (calculates from letter grades)
- `absence.service.js` — `getStudentAbsences()` (grouped by course), `getExcessiveAbsences()` (above threshold)
- `schedule.service.js` — `getStudentSchedule()` (ordered by day + time)
- `plan.service.js` — `getStudentPlan()` (with summary: completed/in_progress/remaining)
- `alert.service.js` — `getStudentAlerts()` (with unread count)
- `news.service.js` — `getNews()` (public, ordered by date)
- `faculty.service.js` — `getFacultyCourses()`, `getCourseStudents()` (verifies faculty owns course)

---

## 11. AI Engine & Natural Language Processing

### 11.1 AI Provider Abstraction

SARA uses a Factory pattern to abstract the AI provider:

```
AI_PROVIDER=gemini  →  GeminiProvider
AI_PROVIDER=openai  →  OpenAIProvider
AI_PROVIDER=ollama  →  OllamaProvider
```

The base class defines the interface:
- `generateResponse(message, context, systemPrompt)` — Single-turn text generation
- `supportsTools()` — Returns true if provider supports function calling
- `selectTool(message, toolSchemas, context, systemPrompt)` — AI selects tool(s) from schema
- `respondWithToolResults(message, toolCalls, toolResults, context, systemPrompt)` — AI formats tool results

### 11.2 System Prompt Engineering

Two system prompts are used depending on the flow:

**Legacy System Prompt (`SYSTEM_PROMPT`):**
- Rules: read-only, no fabrication, no cross-user data
- Style: friendly, concise, professional
- Capabilities: grades, absences, schedule, plan, alerts, news
- Restrictions: no modification, no fees, no transfers

**Tool-Calling System Prompt (`TOOL_SYSTEM_PROMPT`):**
- Strict language rules
- Tool disambiguation keywords (Arabic dialect → specific tool)
- Multi-tool calling instructions
- Security rules
- Response formatting guidelines

### 11.3 Saudi Dialect Support

SARA understands three language registers for each intent:

| Intent | Formal Arabic | Saudi Dialect | English |
|--------|--------------|---------------|---------|
| Grades | درجاتي | وش جايب، كم جبت | my grades, GPA |
| Absences | غيابي | كم غبت، هل انحرمت | absences, am I at risk |
| Schedule | جدولي | وش عندي اليوم | my schedule, timetable |
| Plan | خطتي الدراسية | كم باقي واتخرج | courses left to graduate |
| Alerts | تنبيهاتي | عندي اشعارات | my alerts |

**Dialect Edge Cases Handled:**
- `معدلي` (my GPA) vs `عدّل` (modify) — standalone word boundary detection prevents false positives
- `خطة` vs `خطت` — taa marbuta (ة) vs taa (ت) alternation
- `غايب/اغيب/غبت` — different verb conjugations for "absent"
- `توريني` = `وريني` = `عطني` = `ابي اشوف` — all mean "show me"

### 11.4 Intent Detection (Legacy)

The legacy system uses regex-based intent detection across 11 categories, each with 30-40+ patterns:

| Intent | Pattern Count | Example Patterns |
|--------|--------------|-----------------|
| grades | 40+ | `/درج/i`, `/gpa/i`, `/am i passing/i` |
| absences | 40+ | `/غياب/i`, `/absence/i`, `/am i at risk/i` |
| schedule | 35+ | `/جدول/i`, `/schedule/i`, `/what do i have today/i` |
| plan | 30+ | `/تخرج/i`, `/graduation/i`, `/courses left/i` |
| student_courses | 25+ | `/مواد/i`, `/enrolled/i`, `/what am i taking/i` |
| alerts | 20+ | `/تنبيه/i`, `/alert/i`, `/notification/i` |
| news | 15+ | `/اخبار/i`, `/news/i`, `/announcement/i` |
| faculty_courses | 20+ | `/موادي/i`, `/my courses/i`, `/teaching/i` |
| faculty_absences | 15+ | `/محروم/i`, `/at risk/i`, `/excessive/i` |
| greeting | 30+ | `/مرحبا/i`, `/hello/i`, `/السلام/i` |
| help | 15+ | `/مساعد/i`, `/help/i`, `/what can you do/i` |

### 11.5 Conversation Memory

SARA maintains per-user conversation history using an in-memory Map:
- **Window:** 5 turns (question + answer pairs)
- **TTL:** 30 minutes of inactivity
- **Purpose:** Enables context-aware responses (e.g., "what about their students?" refers to previously mentioned courses)

---

## 12. Tool-Calling Architecture

### 12.1 Motivation

The initial implementation (Phases 1–5) used keyword-based intent detection: regex patterns matched user messages to predefined intents, and each intent mapped to a specific data-fetching function. While effective, this approach had limitations:

1. **Rigid:** Every new capability required writing new regex patterns
2. **Language-Dependent:** Patterns had to be crafted for Arabic, dialect, and English separately
3. **No Multi-Tool:** Could only handle one intent per message
4. **Maintenance Burden:** 400+ patterns to maintain and debug

Phase 6 introduced a tool-calling architecture where the AI model selects from registered tools, and the backend validates and executes the selection.

### 12.2 Components

#### Tool Registry (`server/src/tools/tool-registry.js`)

The registry stores tool definitions — it does not make authorization decisions:

```javascript
registry.register({
  name: "get_student_grades",
  description: "Fetch student's grades and GPA...",
  roles: ["student"],
  parameters: {
    type: "object",
    properties: {
      courseCode: { type: "string", description: "Optional filter" }
    }
  },
  handler: async (args, user) => { /* fetch data */ }
});
```

Key methods:
- `register(tool)` — Validates and stores tool definition
- `listForRole(role)` — Returns only tools the role can access
- `toGeminiSchema(role)` — Exports in Gemini function-calling format
- `toOpenAISchema(role)` — Exports in OpenAI function-calling format

#### Tool Executor (`server/src/tools/tool-executor.js`)

The executor is the security enforcement point. Every tool call passes through four validation steps:

```
Step 1: Does this tool exist in the registry?  → TOOL_NOT_FOUND
Step 2: Is the user's role allowed?             → FORBIDDEN
Step 3: Do the arguments match the schema?      → INVALID_ARGS
Step 4: Execute the handler                     → Result
```

**Critical Design Decision:** The AI's tool selection is advisory only. The executor independently validates every call. This means:
- If the AI hallucinates a non-existent tool → `TOOL_NOT_FOUND`
- If the AI selects a tool for the wrong role → `FORBIDDEN`
- If the AI passes invalid arguments → `INVALID_ARGS`

#### Tool Definitions (`server/src/tools/*.tool.js`)

Nine tools are registered:

| Tool | Role | Parameters | Description |
|------|------|-----------|-------------|
| `get_student_grades` | student | `courseCode?` | Grades + GPA |
| `get_student_absences` | student | `courseCode?` | Absences grouped by course |
| `get_student_schedule` | student | `dayOfWeek?` | Weekly timetable |
| `get_student_plan` | student | `status?` | Degree progress |
| `get_student_alerts` | student | `unreadOnly?` | Notifications |
| `get_news` | student, faculty | `category?` | University news |
| `get_faculty_courses` | faculty | — | Courses + enrollment |
| `get_course_students` | faculty | `courseCode?` | Student rosters |
| `get_excessive_absences` | faculty | `limit?` | At-risk students |

### 12.3 Flow

```
User message: "Show me my grades, absences, and schedule"
       │
       ▼
Provider.selectTool()
  → Gemini returns: [
      { name: "get_student_grades", args: {} },
      { name: "get_student_absences", args: {} },
      { name: "get_student_schedule", args: {} }
    ]
       │
       ▼
For each tool call:
  ToolExecutor.execute()
    → Step 1: Tool exists? YES
    → Step 2: User is student, tool allows student? YES
    → Step 3: Args valid? YES
    → Step 4: Execute handler → data
       │
       ▼
Provider.respondWithToolResults()
  → Gemini formats all three datasets into one natural response
       │
       ▼
Response sent to user with grades + absences + schedule
```

### 12.4 Legacy Fallback

When the AI provider is unavailable (rate-limited, error, etc.), the system automatically falls back to the legacy keyword flow:

```
Tool-calling flow fails
       │
       ▼
detectAllIntents(message, role)
  → ["grades", "absences", "schedule"]
       │
       ▼
For each intent:
  fetchDataForIntent(intent, user)
       │
       ▼
AI formats combined data (or formatFallback if AI also fails)
```

This ensures users always get their data, even when the AI service is completely down.

---

## 13. Security Model

### 13.1 Core Principle: AI ≠ Authorizer

The most critical security decision in SARA is that the AI model never makes authorization decisions. The AI's role is strictly limited to:
1. Understanding the user's question
2. Selecting appropriate tools
3. Formatting the response

All authorization decisions are made by the backend:
- **Who can access what:** Role Guard + Service Scoping
- **What operations are allowed:** ReadOnly Guard
- **Which tools can be called:** Tool Executor role validation

### 13.2 Attack Scenarios and Mitigations

| Attack | Mitigation | Layer |
|--------|-----------|-------|
| Brute force login | Rate limiter: 5 attempts/minute | Layer 1 |
| Stolen/forged JWT | JWT signature verification with secret | Layer 2 |
| Student accessing faculty endpoints | Role Guard blocks with 403 | Layer 3 |
| POST/PUT/DELETE on data routes | ReadOnly Guard blocks with 405 | Layer 4 |
| Student accessing another student's data | Service queries scoped by `userId` | Layer 5 |
| AI hallucinating a write tool | Registry contains only read tools | Layer 6 |
| AI selecting a cross-role tool | Tool Executor re-validates role | Layer 6 |
| AI hallucinating a non-existent tool | Tool Executor returns TOOL_NOT_FOUND | Layer 6 |
| Prompt injection | AI decision is advisory; backend enforces | Layer 6 |
| User requesting write via chat | Pre-filter detects and rejects | Pre-filter |

### 13.3 Write-Attempt Detection

The chat service detects and rejects write attempts before they reach the AI:

**Arabic patterns (60+):** `احذف`, `عدّل`, `غيّر`, `سجل لي`, `ارفع`, `الغي` — with standalone word boundary detection to prevent false positives.

**English patterns (30+):** `delete`, `modify`, `change`, `update`, `register`, `enroll`, `drop` — with verb-specific regex to avoid matching nouns.

**Response:** "SARA operates in read-only mode. I can show you information but cannot make any changes. For modifications, please contact the registrar."

### 13.4 Password Security

- Passwords hashed with bcrypt (12 salt rounds)
- Plaintext passwords never stored or logged
- JWT tokens stored in JavaScript memory only (not localStorage or cookies)
- Token expiry: 1 hour

---

## 14. Frontend Implementation

### 14.1 Application Structure

```
client/src/
├── App.jsx                    — Router + route protection
├── main.jsx                   — React entry point
├── pages/
│   ├── LoginPage.jsx          — Login form with demo credentials
│   ├── ChatPage.jsx           — Full-page chat interface
│   └── WidgetDemoPage.jsx     — Embeddable widget demo
├── components/
│   ├── ChatWidget.jsx         — Floating chat widget (380×560px)
│   ├── ChatMessage.jsx        — Message bubble rendering
│   ├── TypingIndicator.jsx    — Animated loading dots
│   └── QuickActions.jsx       — Role-aware quick action buttons
├── hooks/
│   └── useAuth.jsx            — Auth context + provider
├── services/
│   └── api.js                 — API client with auth headers
└── styles/
    └── index.css              — TailwindCSS + custom palette
```

### 14.2 Login Page

The login page features:
- Clean gradient background with decorative blur elements
- SARA logo with university icon
- Username and password fields
- Demo credential buttons for quick testing:
  - "Student" → fills `441001` / `student123`
  - "Faculty" → fills `dr.omar` / `faculty123`
- Loading spinner during authentication
- Error display for failed login attempts

> [INSERT SCREENSHOT: login-page.png]

### 14.3 Chat Widget

The ChatWidget is the core of SARA's user interface:

**Collapsed State:** A floating circular button in the bottom-left corner with a chat icon and unread badge.

**Expanded State (380×560px):**
- Header with SARA branding and close button
- Message list with auto-scroll
- Quick action buttons (shown before first message):
  - Student: "Grades", "Absences", "Schedule", "Alerts"
  - Faculty: "My Courses", "Absence Report", "News"
- Text input with Enter-to-send (Shift+Enter for newline)
- Typing indicator while AI processes

> [INSERT SCREENSHOT: chat-widget-expanded.png]

### 14.4 Message Rendering

Messages are styled differently based on the sender:
- **User messages:** Right-aligned, colored background
- **SARA messages:** Left-aligned, light background with SARA avatar icon

The AI response supports structured formatting: bullet points, bold text, and multi-section layout for multi-tool responses.

### 14.5 Custom Theme

TailwindCSS custom colors:
- `sara-50` to `sara-900` — Teal/green academic theme for student interface
- `gold-50` to `gold-600` — Gold accent for faculty interface
- Custom font family for headings
- RTL support for Arabic content

---

## 15. Testing & Quality Assurance

### 15.1 Test Summary

| Category | Test Count | File |
|----------|-----------|------|
| Middleware (auth, role, readonly, rate-limit) | ~100 | `server/tests/middleware.test.js` |
| Tool Registry & Executor | 34 | `server/tests/tools.test.js` |
| Chat Flow (pre-filter, tool, legacy, bilingual) | 12 | `server/tests/chat.test.js` |
| Other tests | ~99 | Various test files |
| **Total** | **245+** | — |

### 15.2 Middleware Tests

```
Auth Middleware:
  ✓ Valid token → attaches user to request
  ✓ Missing token → 401 Unauthorized
  ✓ Expired token → 401 Session expired
  ✓ Invalid token → 401 Invalid token

Role Guard:
  ✓ Correct role → passes through
  ✓ Wrong role → 403 Forbidden
  ✓ Multiple allowed roles → any allowed role passes

ReadOnly Guard:
  ✓ GET → allowed
  ✓ HEAD → allowed
  ✓ OPTIONS → allowed
  ✓ POST → 405 Method Not Allowed
  ✓ PUT → 405 Method Not Allowed
  ✓ DELETE → 405 Method Not Allowed
  ✓ PATCH → 405 Method Not Allowed
```

### 15.3 Tool System Tests

```
Tool Registry:
  ✓ Register valid tool
  ✓ Reject duplicate tool name
  ✓ Reject tool with missing fields
  ✓ listForRole("student") → only student tools
  ✓ listForRole("faculty") → only faculty tools
  ✓ toGeminiSchema() → valid format
  ✓ toOpenAISchema() → valid format

Tool Executor:
  ✓ Execute valid tool → returns data
  ✓ Unknown tool name → TOOL_NOT_FOUND error
  ✓ Student calling faculty tool → FORBIDDEN error
  ✓ Faculty calling student tool → FORBIDDEN error
  ✓ Invalid arguments → INVALID_ARGS error
```

### 15.4 Cross-Role Attack Matrix

This critical test verifies that role-based access cannot be bypassed:

| Caller Role | Tool | Expected Result | Test Result |
|------------|------|-----------------|-------------|
| student | `get_student_grades` | SUCCESS | PASS |
| student | `get_faculty_courses` | FORBIDDEN | PASS |
| student | `get_course_students` | FORBIDDEN | PASS |
| student | `get_excessive_absences` | FORBIDDEN | PASS |
| faculty | `get_faculty_courses` | SUCCESS | PASS |
| faculty | `get_student_grades` | FORBIDDEN | PASS |
| faculty | `get_student_absences` | FORBIDDEN | PASS |
| faculty | `get_student_plan` | FORBIDDEN | PASS |

### 15.5 Chat Flow Tests

```
Pre-filter:
  ✓ Greeting → canned response (no AI call)
  ✓ Help request → canned response
  ✓ Write attempt → rejection message
  ✓ Unavailable feature → appropriate message

Tool-calling flow:
  ✓ Valid tool call → data returned
  ✓ Multi-tool call → all tools executed

Legacy fallback:
  ✓ AI failure → keyword detection + formatted response
  ✓ Rate limit → automatic fallback
```

### 15.6 AI-Assisted Testing

During the testing phase, AI tools were used to help generate comprehensive test cases, particularly for:
- Edge cases in regex pattern matching (dialect variations)
- Cross-role attack scenarios
- Identifying gaps in test coverage

All generated tests were reviewed, validated, and integrated into the automated test suite.

---

## 16. Demo Scenarios & Results

### 16.1 Student Demo — Normal Questions

#### Q1: "What are my grades?"
Shows all course grades with letter grades and GPA. Flags failing courses with warnings.
> [INSERT SCREENSHOT: student-q1-grades.png]

#### Q2: "How many absences do I have?"
Shows absences per course with risk analysis: safe, getting close, or denied.
> [INSERT SCREENSHOT: student-q2-absences.png]

#### Q3: "Show me my schedule"
Displays weekly timetable organized by day, with times and room numbers.
> [INSERT SCREENSHOT: student-q3-schedule.png]

#### Q4: "Any university news?"
Lists latest university news and announcements.
> [INSERT SCREENSHOT: student-q4-news.png]

#### Q5: "Do I have any alerts?"
Shows notifications with urgency indicators and unread count.
> [INSERT SCREENSHOT: student-q5-alerts.png]

### 16.2 Student Demo — Impressive Questions

#### Q6: "Show me my grades, absences, and schedule all at once"
**Feature demonstrated:** Multi-tool calling — three different data sources combined in one response.
> [INSERT SCREENSHOT: student-q6-multi-tool.png]

#### Q7: "Am I at risk of denial in any course?"
**Feature demonstrated:** Smart analysis — SARA analyzes absence counts against the denial threshold and provides risk assessment per course.
> [INSERT SCREENSHOT: student-q7-denial-risk.png]

#### Q8: "How many courses do I have left to graduate?"
**Feature demonstrated:** Degree progress tracking — shows completion percentage, completed/in-progress/remaining counts.
> [INSERT SCREENSHOT: student-q8-plan-progress.png]

#### Q9: "What's my GPA and am I failing any course?"
**Feature demonstrated:** Grade analysis — combines GPA display with failure detection and targeted warnings.
> [INSERT SCREENSHOT: student-q9-gpa-failing.png]

#### Q10: "I want to change my grade"
**Feature demonstrated:** Read-only security — write attempt detected and politely rejected with explanation.
> [INSERT SCREENSHOT: student-q10-write-rejected.png]

### 16.3 Faculty Demo — Normal Questions

#### Q1: "What courses am I teaching this semester?"
Shows assigned courses with enrollment counts.
> [INSERT SCREENSHOT: faculty-q1-courses.png]

#### Q2: "Show me the students in CS101"
Shows full student roster for the specified course.
> [INSERT SCREENSHOT: faculty-q2-roster.png]

#### Q3: "Any university news?"
Lists latest university news (same tool as student, shared access).
> [INSERT SCREENSHOT: faculty-q3-news.png]

#### Q4: "How many students are at risk of denial?"
Shows students exceeding the absence limit across all faculty courses.
> [INSERT SCREENSHOT: faculty-q4-at-risk.png]

#### Q5: "Hello"
**Feature demonstrated:** Canned response — greetings are answered instantly without any AI call (saves quota, zero latency).
> [INSERT SCREENSHOT: faculty-q5-greeting.png]

### 16.4 Faculty Demo — Impressive Questions

#### Q6: "Show me all my courses and their students"
**Feature demonstrated:** Full roster retrieval across all courses in one response.
> [INSERT SCREENSHOT: faculty-q6-all-rosters.png]

#### Q7: "Which students have excessive absences across all my courses?"
**Feature demonstrated:** Cross-course absence analysis identifying at-risk students.
> [INSERT SCREENSHOT: faculty-q7-excessive.png]

#### Q8: "Show me my courses, the news, and at-risk students all at once"
**Feature demonstrated:** Multi-tool calling — three different tools called simultaneously.
> [INSERT SCREENSHOT: faculty-q8-multi-tool.png]

#### Q9: "How many students are enrolled in CS201 and how many have high absences?"
**Feature demonstrated:** Combined enrollment + absence analysis for a specific course.
> [INSERT SCREENSHOT: faculty-q9-enrollment-absences.png]

#### Q10: "I want to delete a student's grade"
**Feature demonstrated:** Security enforcement for faculty — write attempts blocked for all roles.
> [INSERT SCREENSHOT: faculty-q10-write-rejected.png]

---

## 17. Team Contributions

### 17.1 Role Distribution

| Role | Student | Key Responsibilities |
|------|---------|---------------------|
| Project Manager + AI Engineer | Student 1 | Architecture design, documentation, AI provider integration, tool-calling system, conversation memory |
| Backend Developer | Student 2 | Express server, authentication, 7 services, 7 controllers, 7 routes, configuration |
| Backend Developer + QA | Student 3 | 5 middleware files, 245+ test cases, middleware chain integration |
| AI Engineer (NLP) | Student 4 | 400+ regex patterns, Saudi dialect support, intent detection, tool descriptions |
| Frontend Developer | Student 5 | 3 pages, React routing, auth context, API service layer |
| Frontend Developer | Student 6 | ChatWidget component, chat UI components, TailwindCSS theme, Vite config |

### 17.2 Detailed Contributions

#### Student 1 — Project Manager + AI Engineer

**Project Management:**
- Designed the complete project roadmap across 7 phases
- Created and maintained 6 documentation files
- Maintained CLAUDE.md as the project's living technical reference (400+ lines)
- Recorded 17 major technical decisions with rationale
- Defined role boundaries and integration points

**AI Engineering:**
- Built the AI Provider Abstraction Layer (base class, factory, Gemini/OpenAI/Ollama providers)
- Implemented Gemini function-calling integration: `selectTool()`, `respondWithToolResults()`
- Designed system prompts for both legacy and tool-calling modes
- Built the Tool Registry and Tool Executor
- Created 9 tool definitions with role restrictions
- Implemented conversation memory (5-turn, 30-minute TTL)
- Rewrote chat service with tool-calling + legacy fallback architecture

#### Student 2 — Backend Developer

- Set up Express server with security middleware (Helmet, CORS, body limit)
- Implemented JWT authentication system (login, token generation, verification)
- Built 7 service files with scoped database queries
- Built 7 controller files with consistent error handling
- Built 7 route files with role-specific guards
- Created centralized configuration from environment variables

#### Student 3 — Backend Developer + QA

- Implemented 5 middleware files:
  - Auth middleware (JWT verification, bilingual errors)
  - Role guard (factory pattern, multiple roles)
  - ReadOnly guard (method whitelist)
  - Rate limiter (3 tiers: general, auth, chat)
  - Error handler (structured JSON responses)
- Wrote 245+ automated tests:
  - Middleware unit tests (all auth, role, readonly scenarios)
  - Tool system tests (34 tests: registry, executor, cross-role attacks)
  - Chat flow tests (12 tests: pre-filter, tool, legacy, bilingual)

#### Student 4 — AI Engineer (NLP Specialist)

- Designed and implemented 400+ regex patterns across 11 intent categories
- Covered formal Arabic, Saudi dialect, and English for each intent
- Handled dialect edge cases (word boundary, taa marbuta, verb conjugations)
- Wrote rich tool descriptions for Gemini disambiguation
- Built canned response system (greeting, help, write rejection, unavailable)
- Created live testing scripts for dialect validation

#### Student 5 — Frontend Developer

- Built application shell with React Router and route protection
- Created Login Page with gradient design, demo credentials, error handling
- Created Chat Page for full-screen chat interface
- Created Widget Demo Page showing embeddable widget concept
- Built authentication hook (AuthProvider context) with in-memory token storage
- Built API service layer with automatic auth header injection

#### Student 6 — Frontend Developer

- Built ChatWidget component (floating, collapsible, 380×560px)
- Built ChatMessage component with role-based styling
- Built TypingIndicator with animated dots
- Built QuickActions with role-aware buttons
- Designed TailwindCSS custom theme (sara + gold palettes)
- Configured Vite dev server with API proxy
- Implemented RTL support for Arabic content

### 17.3 Shared Responsibilities

| Area | Shared Between |
|------|---------------|
| Database Design (9 Prisma models) | Students 1, 2 |
| Seed Script (300 students dataset) | Students 1, 2 |
| Security Policy Design | Students 1, 3 |
| AI + NLP Integration | Students 1, 4 |
| Frontend Integration | Students 5, 6 |

---

## 18. Challenges & Solutions

### 18.1 Technical Challenges

| Challenge | Description | Solution |
|-----------|-------------|----------|
| Dialect False Positives | `معدلي` (GPA) was matching `عدل` (modify), triggering write rejection | Implemented standalone word boundary detection using Arabic-specific regex: `(^\|[\s،.؟!])عدل` |
| Gemini Tool Confusion | Gemini confused absences with grades when user asked in Arabic dialect | Added exhaustive dialect examples directly in tool descriptions: "غايب/اغيب/غبت = absences, NOT grades" |
| Multi-Intent Detection | User asks for 3 things at once but legacy flow only detects first match | Implemented `detectAllIntents()` that returns all matching intents, then fetches and formats all data |
| Pattern Priority | "How many courses left to graduate" matched `student_courses` before `plan` | Reordered patterns and added specific patterns: `/courses do i have left/i`, `/left to graduate/i` |
| Taa Marbuta | `خطة` (plan) vs `خطت` — different spellings of same word | Changed regex to `/خط[ةت]/i` to match both forms |
| Help False Positive | Any `?` in message triggered help response | Separated `?` to standalone pattern: `/^\s*\?+\s*$/` |
| News Duplication | News appeared 3 times in seed data | Added `prisma.news.deleteMany({})` to seed clear section |
| Rate Limiting | Gemini free tier limited to 5 requests/minute, each tool turn uses 2 calls | Three-layer strategy: canned responses skip AI, legacy fallback on rate limit, conversation memory reduces redundant calls |

### 18.2 Design Challenges

| Challenge | Description | Solution |
|-----------|-------------|----------|
| AI as Authorizer Risk | AI could potentially select tools for the wrong role | Tool Executor independently re-validates role — AI selection is advisory only |
| Response Truncation | Multi-tool responses were cut off at 1024 tokens | Increased `maxOutputTokens` to 2048 for tool result formatting |
| Keyword vs Tool-Calling | Choosing between keyword-based and AI-based approach | Implemented both: AI as primary, keywords as fallback — defense in depth |
| Provider Lock-in | Project should not depend on a single AI provider | Factory pattern with abstract base class — switch via environment variable |

---

## 19. Future Work

### 19.1 Short-Term Improvements

| Feature | Description |
|---------|-------------|
| Redis Conversation Memory | Replace in-memory Map with Redis for multi-instance scalability |
| Full OpenAI Tool-Calling | Extend `selectTool()` and `respondWithToolResults()` to OpenAI provider |
| Admin Dashboard | Web interface for monitoring chat logs, usage statistics, and audit trails |
| Enhanced Absence Analysis | Predict denial risk based on absence rate and remaining classes |

### 19.2 Long-Term Vision

| Feature | Description |
|---------|-------------|
| Multi-University Deployment | One SARA codebase with per-university tool configurations |
| Voice Input | Speech-to-text for accessibility and convenience |
| Document Generation | Generate transcripts, enrollment letters, and certificates |
| Learning Analytics | Track student engagement and academic performance trends |
| Mobile App | Native mobile application with push notifications |
| Integration APIs | Connect to real university SIS systems (PeopleSoft, Banner) |

---

## 20. Conclusion

SARA (Smart Academic Read-Only Assistant) demonstrates that AI can be safely integrated into university academic systems while maintaining strict security guarantees. The project addresses the core tension between AI accessibility and data security through a clear architectural principle: **the AI is the interpreter, not the authorizer**.

### Key Achievements:

1. **Security:** Six-layer defense-in-depth model with 245+ tests proving that cross-role attacks, write attempts, and AI hallucinations cannot bypass access control.

2. **Natural Language:** Support for formal Arabic, Saudi dialect, and English across 11 intent categories with 400+ patterns, making academic data accessible through natural conversation.

3. **Tool-Calling Architecture:** A flexible, extensible system where adding a new capability means registering a new tool — not rewriting keyword lists. This design makes SARA multi-university ready.

4. **Smart Analysis:** SARA does not just display data — it analyzes absences for denial risk, detects failing grades, tracks degree progress, and provides actionable insights.

5. **Resilience:** Automatic fallback from AI tool-calling to keyword-based detection ensures users always get their data, even when the AI service is unavailable.

6. **Clean Architecture:** Clear separation of concerns (frontend, middleware, services, AI, tools) makes the system maintainable, testable, and extensible.

SARA is a proof-of-concept that validates the feasibility of AI-powered academic assistants in Saudi university environments. The architecture and security patterns established in this project can serve as a foundation for production-grade deployments.

---

## 21. References

1. Wollny, S., Henseler, J., & Bieger, T. (2021). "Are Chatbots Worth It? A Systematic Review of Educational Chatbots." *International Journal of Educational Technology in Higher Education*, 18(1).

2. Smutny, P., & Schreiberova, P. (2020). "Chatbots for Learning: A Review of Educational Chatbots for the Facebook Messenger." *Computers & Education*, 151.

3. Saltzer, J.H., & Schroeder, M.D. (1975). "The Protection of Information in Computer Systems." *Proceedings of the IEEE*, 63(9), 1278-1308.

4. NIST (2020). "Security and Privacy Controls for Information Systems and Organizations." NIST Special Publication 800-53, Revision 5.

5. Habash, N.Y. (2010). *Introduction to Arabic Natural Language Processing*. Morgan & Claypool Publishers.

6. Google (2024). "Gemini API: Function Calling." Google AI Developer Documentation.

7. OpenAI (2024). "Function Calling." OpenAI Platform Documentation.

8. Prisma (2024). "Prisma ORM Documentation." Prisma Technologies.

9. Express.js (2024). "Express: Fast, Unopinionated, Minimalist Web Framework for Node.js." OpenJS Foundation.

10. React (2024). "React: A JavaScript Library for Building User Interfaces." Meta Platforms.

---

## 22. Appendices

### Appendix A: Environment Setup Guide

```bash
# 1. Clone the repository
git clone [repository-url]
cd smart-academic-assistant

# 2. Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# 3. Set up environment variables
cp server/.env.example server/.env
# Edit server/.env:
#   PORT=3001
#   JWT_SECRET=your-secret-key
#   AI_PROVIDER=gemini
#   GEMINI_API_KEY=your-gemini-key

# 4. Set up database
cd server
npx prisma generate
npx prisma db push
npm run seed

# 5. Run the application
# Terminal 1 — Backend:
PORT=3001 node server/src/index.js

# Terminal 2 — Frontend:
cd client && npm run dev
# Open http://localhost:5173
```

### Appendix B: Test Account Credentials

| Account | Username | Password | Role |
|---------|----------|----------|------|
| Test Student 1 | `441001` | `student123` | student |
| Test Student 2 | `441002` | `student123` | student |
| Test Faculty | `dr.omar` | `faculty123` | faculty |

### Appendix C: Project File Structure

```
smart-academic-assistant/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── WidgetDemoPage.jsx
│   │   ├── components/
│   │   │   ├── ChatWidget.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── QuickActions.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── index.css
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   └── index.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.guard.js
│   │   │   ├── readonly.guard.js
│   │   │   ├── rate-limiter.js
│   │   │   ├── error-handler.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── grade.routes.js
│   │   │   ├── absence.routes.js
│   │   │   ├── schedule.routes.js
│   │   │   ├── plan.routes.js
│   │   │   ├── alert.routes.js
│   │   │   ├── news.routes.js
│   │   │   ├── faculty.routes.js
│   │   │   ├── chat.routes.js
│   │   │   └── health.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── grade.controller.js
│   │   │   ├── absence.controller.js
│   │   │   ├── schedule.controller.js
│   │   │   ├── plan.controller.js
│   │   │   ├── alert.controller.js
│   │   │   ├── news.controller.js
│   │   │   └── faculty.controller.js
│   │   ├── services/
│   │   │   ├── chat.service.js
│   │   │   ├── grade.service.js
│   │   │   ├── absence.service.js
│   │   │   ├── schedule.service.js
│   │   │   ├── plan.service.js
│   │   │   ├── alert.service.js
│   │   │   ├── news.service.js
│   │   │   ├── faculty.service.js
│   │   │   └── conversation-memory.js
│   │   ├── providers/
│   │   │   ├── base.provider.js
│   │   │   ├── factory.js
│   │   │   ├── gemini.provider.js
│   │   │   ├── openai.provider.js
│   │   │   ├── ollama.provider.js
│   │   │   └── system-prompt.js
│   │   └── tools/
│   │       ├── tool-registry.js
│   │       ├── tool-executor.js
│   │       ├── index.js
│   │       ├── grades.tool.js
│   │       ├── absences.tool.js
│   │       ├── schedule.tool.js
│   │       ├── plan.tool.js
│   │       ├── alerts.tool.js
│   │       ├── news.tool.js
│   │       └── faculty.tool.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── tests/
│   │   ├── middleware.test.js
│   │   ├── tools.test.js
│   │   └── chat.test.js
│   └── package.json
├── docs/
│   ├── project_overview.md
│   ├── requirements.md
│   ├── architecture.md
│   ├── security_policies.md
│   ├── implementation_plan.md
│   └── team-contributions.md
├── CLAUDE.md
└── README.md
```

### Appendix D: API Response Examples

#### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "441001",
    "role": "student",
    "nameAr": "أحمد محمد",
    "nameEn": "Ahmed Mohammed"
  }
}
```

#### Grades Response
```json
{
  "grades": [
    {
      "courseCode": "CS201",
      "courseNameEn": "Data Structures",
      "midterm": 25,
      "final": 30,
      "assignments": 17,
      "total": 72,
      "letterGrade": "C"
    }
  ],
  "gpa": { "gpa": 1.69 }
}
```

#### Chat Response
```json
{
  "reply": "Your grades, Ahmed Mohammed:\n\n• Data Structures (CS201): 72/100 — C\n...",
  "intent": "grades",
  "tools": ["get_student_grades"]
}
```

### Appendix E: Decision Log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| 1 | 2026-04-08 | SQLite for development | Zero-config, single file, easy to reset |
| 2 | 2026-04-08 | Prisma as ORM | Type-safe, multi-database support |
| 3 | 2026-04-08 | JWT for authentication | Stateless, simple, widely supported |
| 4 | 2026-04-08 | AI Provider abstraction | Swap providers without refactoring |
| 5 | 2026-04-08 | ReadOnly Guard middleware | Defense-in-depth against accidental writes |
| 6 | 2026-04-10 | Google Gemini as default AI | Free tier with function calling support |
| 7 | 2026-04-10 | Saudi dialect support | Core requirement for target users |
| 8 | 2026-04-10 | Portal as demo shell | Project is the widget, not the portal |
| 9 | 2026-04-15 | Tool-calling over keywords | Extensible: new tool = new capability |
| 10 | 2026-04-15 | Registry + Executor separation | Defense-in-depth: AI selects, backend enforces |
| 11 | 2026-04-15 | Pre-filter canned responses | Save AI quota, zero latency for common cases |
| 12 | 2026-04-15 | In-process conversation memory | POC scope — swap to Redis for production |
| 13 | 2026-04-15 | Legacy fallback kept | Defense when AI unavailable or rate-limited |
| 14 | 2026-04-17 | Large seed dataset (300+30+20) | Realistic demo; deterministic PRNG |
| 15 | 2026-04-17 | Rich tool descriptions with dialect | Fixes Gemini's tool confusion |
| 16 | 2026-04-17 | Expanded intent patterns (400+) | Broad legacy fallback coverage |
| 17 | 2026-04-18 | Bilingual responses (EN/AR) | Reply in user's language |

---

*End of Report*
