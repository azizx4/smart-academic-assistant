# SARA — Demo Script

## Setup (before the presentation)

```bash
cd server
node prisma/seed.js          # seed the database
PORT=3001 node src/index.js   # start backend
cd ../client && npm run dev   # start frontend → http://localhost:5173
```

## Test Accounts

| Username | Password | Role | Name |
|----------|----------|------|------|
| 441001 | student123 | student | Ahmed Mohammed |
| 441002 | student123 | student | Sara Khalid |
| dr.omar | faculty123 | faculty | Dr. Omar Hassan |

---

## Demo Flow (10-15 minutes)

### 1. Open the Widget (1 min)
- Open http://localhost:5173
- Show the portal page — point out: "SARA is the widget in the corner, not the portal itself"
- Click the chat widget to open it

### 2. Student Login (1 min)
- Login as **441001 / student123**
- Show the greeting message

### 3. Arabic Formal (2 min)
Ask in order:
```
وش درجاتي
```
> Shows grades with Arabic course names + GPA

```
وش غيابي
```
> Shows absences per course

```
ابي جدولي
```
> Shows weekly schedule

### 4. Saudi Dialect (2 min)
```
توريني غيابي
```
> "توريني" = "وريني" = show me — dialect understood

```
كم باقي واتخرج
```
> Shows academic plan (completed/in-progress/remaining)

```
هل انا محروم
```
> Shows absence status — checks denial risk

### 5. English Support (2 min)
```
show me my grades
```
> Response in English with English course names!

```
do I have any alerts?
```
> Alerts translated to English

```
give me a summary
```
> Overall status in English (GPA, courses, absences, alerts)

### 6. Security — Write Rejection (1 min)
```
delete my absences
```
> "Sorry, SARA operates in read-only mode."

```
ابي اسجل مادة
```
> Arabic write rejection

### 7. Out-of-Scope (30 sec)
```
tuition fees?
```
> "This service is not currently available in SARA."

### 8. Faculty Login (2 min)
- Logout → Login as **dr.omar / faculty123**

```
what courses do I teach?
```
> Shows CS101 + CS201 with enrollment counts

```
which students have too many absences?
```
> Shows at-risk students across faculty's courses

```
مين قريب من الحرمان
```
> Same data in Arabic

### 9. Security Demo (1 min)
Point out:
- Student cannot access faculty endpoints (role guard)
- AI selects tools but backend re-validates every call
- No write endpoints exist — ReadOnlyGuard blocks POST/PUT/DELETE on data routes
- JWT authentication on every request

### 10. Architecture Quick View (1 min)
Show the flow:
```
User → Rate Limiter → JWT Auth → Role Guard → ReadOnly Guard → Controller
                                                                    ↓
                                                            Service (scoped query)
                                                                    ↓
                                                            AI Provider (filtered data only)
```

---

## Quick Answers for Common Questions

**Q: Why not use ChatGPT directly?**
A: ChatGPT would have access to ALL data. SARA enforces scoping — the AI only sees data the user is authorized to view.

**Q: What if the AI hallucinates a tool name?**
A: ToolExecutor returns TOOL_NOT_FOUND. Only registered tools can execute.

**Q: What if a student tries to call a faculty tool?**
A: ToolExecutor checks role on every call → FORBIDDEN. AI selection is advisory only.

**Q: Why two flows (tool-calling + legacy)?**
A: Defense-in-depth. If Gemini is down or rate-limited, legacy keyword flow takes over seamlessly.

**Q: Can this work for another university?**
A: Yes — register new tools in the registry, no keyword lists to maintain. Tool-calling architecture is university-agnostic.

**Q: Why SQLite?**
A: Zero-config for development. Prisma ORM supports switching to PostgreSQL with one config change.

---

## If Something Goes Wrong

| Problem | Fix |
|---------|-----|
| Server won't start | Check if port 3001 is free: `lsof -i :3001` |
| Gemini rate limit | Wait 60 seconds, or rely on legacy fallback (automatic) |
| Blank AI response | Canned responses still work (greeting/help/write/unavailable) |
| Database empty | Re-run `node prisma/seed.js` |
| Tests fail | `cd server && npx vitest run` — should be 245/245 |
