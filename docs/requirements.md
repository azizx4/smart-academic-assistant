# Requirements — SARA

## Functional Requirements

### FR-01: Authentication
- Users log in with username + password
- System returns JWT token on success
- Token required for all protected endpoints

### FR-02: Student Grade Inquiry
- Student can view their grades for all enrolled courses
- Includes: midterm, final, assignments, total, letter grade
- GPA calculated automatically

### FR-03: Student Absence Inquiry
- Student can view absence records grouped by course
- Includes: date, reason (if provided)
- Total count per course displayed

### FR-04: Student Schedule
- Student can view weekly class schedule
- Includes: day, time, course, room, instructor

### FR-05: Student Courses
- Student can view currently registered courses
- Derived from schedule data

### FR-06: Academic Plan
- Student can view academic plan
- Courses grouped by: completed, in-progress, remaining
- Summary counts provided

### FR-07: Student Alerts
- Student can view notifications/warnings
- Types: urgent, warning, info
- Unread count tracked

### FR-08: University News
- All authenticated users can view university news
- Categories: announcement, competition, news

### FR-09: Faculty Course View
- Faculty can view courses they teach
- Includes enrolled student count and schedule

### FR-10: Faculty Absence Report
- Faculty can view students exceeding absence limit
- Scoped to their own courses only

### FR-11: AI Chat Interface
- Natural language queries in Arabic and English
- Saudi dialect support
- Intent detection with 12 intent types
- Graceful fallback when AI is unavailable
- Polite rejection of write/modify requests
- Polite handling of unavailable features

### FR-12: Multi-language UI
- Arabic and English toggle
- RTL/LTR layout switching

## Non-Functional Requirements

### NFR-01: Security
- Read-only enforcement via ReadOnlyGuard middleware
- Role-based access control
- AI has no direct database access
- Rate limiting on all endpoints
- Token in memory only (no localStorage)

### NFR-02: Performance
- API response time < 500ms for data queries
- AI response time depends on provider (1-5 seconds)
- Fallback response instant when AI fails

### NFR-03: Modularity
- AI provider swappable via configuration
- Services are independent and testable
- Widget is embeddable in any web page

### NFR-04: Maintainability
- Clear separation: routes → controllers → services
- Documented code with consistent patterns
- Comprehensive CLAUDE.md for AI context

### NFR-05: Usability
- Saudi Arabic dialect understanding
- Responsive portal layout
- Collapsible sidebar
- Floating chat widget (non-intrusive)
