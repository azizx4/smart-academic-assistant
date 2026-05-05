# Project Overview — SARA

## Smart Academic Read-Only Assistant

### What is SARA?
SARA is an AI-powered chat widget designed to be embedded in university student portals. It allows students and faculty to query academic data using natural language — including Saudi Arabic dialect — while enforcing strict read-only access to all academic information.

### Why SARA?
University portals (like PeopleSoft) require students to navigate through multiple menus and pages to find basic information. SARA provides instant answers through a conversational interface:

Instead of: Portal → Academics → View Grades → Select Term → View
With SARA: Type "وش درجاتي؟" → Instant answer

### Project Scope
This is a **graduation project proof-of-concept**, NOT a production system. The goal is to demonstrate:

1. **Feasibility** — AI can understand academic queries in Arabic/Saudi dialect
2. **Security** — Read-only access can be enforced at every layer
3. **Flexibility** — AI providers can be swapped without code changes
4. **Clean Architecture** — Separation of concerns, documented decisions

### What Was Built
- Express.js backend with 13 API endpoints
- JWT authentication with role-based access control
- 4-layer middleware security chain
- Prisma ORM with 9 database models
- AI chat with intent detection (12 intent types)
- Swappable AI providers (Gemini, OpenAI, Ollama)
- React frontend with embeddable chat widget
- Portal demo with Arabic/English support
- Saudi dialect understanding
- 16 unit tests
- Complete documentation

### What Was NOT Built (By Design)
- Course registration/enrollment
- Payment/financial systems
- Document generation
- Email integration
- Admin panel
- Production deployment

These are documented as **Future Work** — proving the architecture supports expansion without implementing unnecessary features for a graduation project.

### Key Innovation
The architectural separation between AI and authorization. The AI model NEVER has direct database access and NEVER makes authorization decisions. All data is pre-filtered by the backend based on the authenticated user's role and identity before being sent to the AI for formatting.

This means even if the AI is compromised or returns unexpected output, it cannot access unauthorized data — because it never had access in the first place.

### Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| Student | 441001 | student123 |
| Faculty | dr.omar | faculty123 |
