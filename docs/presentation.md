# SARA — Graduation Project Presentation
## Marketing-Style | 14 Slides

---

## Slide 1: Title

<div align="center">

![University Logo](screenshots/university-logo.png)

# <span style="color:#E63946">S</span><span style="color:#457B9D">A</span><span style="color:#2A9D8F">R</span><span style="color:#E9C46A">A</span>

### Smart Academic Read-Only Assistant

**College of Computer Science and Information Technology**

---

| | |
|---|---|
| **Students** | Abdulaziz, [Student 2], [Student 3] |
| **Supervisor** | Dr. [Supervisor Name] |
| **Academic Year** | 1447 H / 2025-2026 |

</div>

---

## Slide 2: The Academic Portal Today (SIS)

### What does SIS offer students?

| Service | Available? |
|---|---|
| View grades & GPA | Yes |
| View schedule | Yes |
| Track absences | Yes |
| Academic plan & progress | Yes |
| Alerts & notifications | Yes |
| University news | Yes |

### So what's the problem?

- Navigating **5+ different pages** just to check your GPA
- **No single view** — you jump between tabs, menus, and submenus
- **No natural language** — you can't just *ask* a question
- **Arabic dialect?** Forget about it
- **Faculty** have no quick way to spot at-risk students
- **Mobile experience** is frustrating and slow

> **The data is there. The experience is not.**

---

## Slide 3: What If You Could Just... Ask?

<div align="center">

### Instead of clicking through 5 pages...

> "Show my grades"

### Instead of manually checking each course's absences...

> "Am I at risk of denial in any course?"

### Instead of navigating the Arabic-unfriendly interface...

> "ورني جدولي" / "كم غيابي؟" / "وش وضعي؟"

---

### This is why we built **SARA**

A lightweight AI chat widget that sits in the corner of your portal.

**One conversation. All your academic data. In your language.**

</div>

---

## Slide 4: How SARA Works — Architecture

> [INSERT IMAGE: screenshots/architecture-diagram.png]

```
Student/Faculty  -->  Chat Widget (React)
                           |
                      Express API
                           |
            +--------------+--------------+
            |              |              |
       Rate Limiter    JWT Auth     ReadOnly Guard
            |              |              |
            +--------------+--------------+
                           |
                    Service Layer (scoped queries)
                           |
                    Prisma ORM --> Database
                           |
                    AI Provider (Gemini)
                           |
                    Formatted Response
```

### Key Design Principle:

| AI's Job | Backend's Job |
|---|---|
| Understand the question | Verify identity (JWT) |
| Select the right tool | Check role (student/faculty) |
| Format the response | Block all writes |
| | Scope data to current user only |

> **The AI is the interpreter. The backend is the gatekeeper.**

---

## Slide 5: The Tech Behind SARA

| Layer | Technology | Why? |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | Fast, modern, responsive |
| Backend | Node.js + Express | Lightweight, scalable |
| Database | SQLite (dev) / PostgreSQL (prod) | Zero-config dev, robust prod |
| ORM | Prisma | Type-safe, multi-DB |
| Auth | JWT + bcrypt | Stateless, secure |
| AI | Google Gemini 2.5 Flash | Free tier + function calling |
| Testing | Vitest + Supertest | 245+ automated tests |

### Swappable AI:
Gemini today. OpenAI tomorrow. Ollama on-premise. **One environment variable.**

---

## Slide 6: Smart Tool-Calling — Not Just Keywords

### The Old Way (Keyword Matching):
- "grades" --> show grades
- "درجاتي" --> show grades
- New phrase? **Breaks.**

### SARA's Way (AI Function Calling):
- AI **understands meaning**, not just keywords
- Picks the right tool from 9 available tools
- Backend **validates** and **executes** safely
- New capability = register one new tool

```
Student: "هل أنا قريب من الحرمان؟"
  --> Gemini understands: absence risk question
  --> Selects: get_student_absences
  --> Backend: validates role ✓, fetches data
  --> Gemini: formats response with risk analysis
```

### 9 Tools Available:

| Student (6) | Faculty (3) |
|---|---|
| Grades & GPA | My Courses |
| Absences & Risk | Student Rosters |
| Schedule | At-Risk Students |
| Academic Plan | |
| Alerts | |
| News | |

---

## Slide 7: Security — Why You Can Trust SARA

### 5 Layers of Protection:

| # | Layer | What it does |
|---|---|---|
| 1 | **Rate Limiter** | Prevents abuse & brute force |
| 2 | **JWT Authentication** | Verifies who you are |
| 3 | **Role Guard** | Student vs Faculty access |
| 4 | **ReadOnly Guard** | No write/update/delete — ever |
| 5 | **Data Scoping** | You only see YOUR data |

### Attack Scenarios We Tested:

| Attack | Result |
|---|---|
| Student tries faculty tool | **FORBIDDEN** |
| "Delete my grades" | **Write rejected** |
| AI hallucinates a tool | **TOOL_NOT_FOUND** |
| Expired token | **Session expired** |
| Access other student's data | **Impossible by design** |

> **Even if the AI is tricked, the backend says NO.**

---

## Slide 8: Demo — Student Experience

> [INSERT IMAGE: screenshots/student-login.png]

### Asking about grades:

> [INSERT IMAGE: screenshots/student-grades.png]

### Asking about schedule:

> [INSERT IMAGE: screenshots/student-schedule.png]

### Asking in Saudi dialect ("ورني درجاتي"):

> [INSERT IMAGE: screenshots/student-arabic-grades.png]

---

## Slide 9: Demo — Smart Analysis

### Multi-tool in one question:
> "Show my grades, absences, and schedule"

> [INSERT IMAGE: screenshots/student-multi-tool.png]

### Risk detection:
> "Am I at risk of denial?"

> [INSERT IMAGE: screenshots/student-risk-analysis.png]

### Degree progress:
> "How many courses left to graduate?"

> [INSERT IMAGE: screenshots/student-plan-progress.png]

### Write attempt blocked:
> "I want to change my grade" --> **Rejected (read-only)**

> [INSERT IMAGE: screenshots/student-write-rejected.png]

---

## Slide 10: Absence Tracking — Protecting Students

### The Problem:
- Students don't realize they're close to the **denial limit** (5 absences)
- Faculty can't quickly identify **at-risk students** across courses
- No proactive **warnings** until it's too late

### How SARA Helps:

**For Students:**

| Course | Count | Dates | Status |
|---|---|---|---|
| Data Structures (CS201) | 3 | Apr 9, Mar 1, Feb 15 | ✅ OK |
| Software Testing (SE301) | 2 | Apr 19, Feb 23 | ✅ OK |
| General Physics I (PHYS101) | 4 | May 1, Apr 10, Mar 5, Feb 20 | ⚠️ Risk |

> "You have 4 absences in Physics — one more and you'll be denied."

**For Faculty:**
> "Which students are at risk across my courses?"

> [INSERT IMAGE: screenshots/faculty-at-risk-students.png]

### Automatic Alerts:
SARA generates alerts when absences reach warning thresholds — students see them instantly.

---

## Slide 11: Bilingual & Dialect Support

### SARA speaks your language:

| You ask in... | SARA responds in... |
|---|---|
| English | English |
| Arabic (formal) | Arabic |
| Saudi dialect | Arabic |

### Saudi Dialect Examples:

| What you say | What SARA understands |
|---|---|
| "ورني درجاتي" | Show my grades |
| "كم غيابي؟" | How many absences? |
| "وش وضعي؟" | What's my overall status? |
| "ابي جدولي" | Show my schedule |
| "هل انحرمت؟" | Am I denied? |

> [INSERT IMAGE: screenshots/dialect-demo.png]

> **No other university system understands Saudi dialect.**

---

## Slide 12: Demo — Faculty Experience

### My courses & students:

> [INSERT IMAGE: screenshots/faculty-courses.png]

### Student roster:

> [INSERT IMAGE: screenshots/faculty-roster.png]

### Excessive absences report:

> [INSERT IMAGE: screenshots/faculty-excessive-absences.png]

### Multi-tool (courses + at-risk + news):

> [INSERT IMAGE: screenshots/faculty-multi-tool.png]

---

## Slide 13: Testing & Reliability

### 245+ Automated Tests

| Category | Tests | What they verify |
|---|---|---|
| Middleware | Auth, Role, ReadOnly, Rate Limit | Security chain works |
| Tool Registry | 34 tests | Tools register & validate correctly |
| Tool Executor | Role matrix attacks | Cross-role access blocked |
| Chat Flow | 12 tests | End-to-end conversation works |

### Realistic Dataset:
- **300 students** | **30 faculty** | **20 courses** | **8 departments**
- Realistic grade distribution (A+ 5% --> F 10%)
- Deterministic — same data every run

### Fallback System:
If Gemini is down or rate-limited --> **legacy keyword system activates automatically**.
Students always get their data.

---

## Slide 14: Thank You

<div align="center">

# <span style="color:#E63946">S</span><span style="color:#457B9D">A</span><span style="color:#2A9D8F">R</span><span style="color:#E9C46A">A</span>

### Smart Academic Read-Only Assistant

**Secure. Bilingual. Intelligent.**

---

| What we proved | |
|---|---|
| AI can serve students **without** compromising security | ✅ |
| Saudi dialect can be a **first-class** input language | ✅ |
| One widget can replace **5+ pages** of navigation | ✅ |
| The system can work with **any university's data** | ✅ |

---

### Built with
React + Express + Prisma + Gemini AI

### Tested with
245+ automated tests

### Supports
English + Arabic + Saudi Dialect

---

**Thank you**

Any questions?

</div>

---

## Appendix: Screenshots Checklist

To complete this presentation, capture these screenshots and place them in `docs/screenshots/`:

| Filename | What to capture |
|---|---|
| `university-logo.png` | University logo |
| `architecture-diagram.png` | Architecture diagram |
| `student-login.png` | Login screen with student credentials |
| `student-grades.png` | "Show my grades" response |
| `student-schedule.png` | "Show my schedule" response |
| `student-arabic-grades.png` | "ورني درجاتي" response (Arabic) |
| `student-multi-tool.png` | Multi-tool question response |
| `student-risk-analysis.png` | "Am I at risk?" response |
| `student-plan-progress.png` | Degree plan progress |
| `student-write-rejected.png` | Write attempt rejected |
| `faculty-courses.png` | Faculty courses list |
| `faculty-roster.png` | Student roster for a course |
| `faculty-at-risk-students.png` | At-risk students report |
| `faculty-excessive-absences.png` | Excessive absences report |
| `faculty-multi-tool.png` | Faculty multi-tool response |
| `dialect-demo.png` | Saudi dialect conversation |
