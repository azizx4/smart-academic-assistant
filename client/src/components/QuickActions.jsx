// ==============================================
// SARA — Quick Action Chips
// Suggestion buttons for common queries
// ==============================================

const STUDENT_ACTIONS = [
  { label: "Grades", message: "Show my grades" },
  { label: "Absences", message: "How many absences do I have?" },
  { label: "Schedule", message: "Show my schedule" },
  { label: "Plan", message: "Show my academic plan" },
  { label: "Alerts", message: "Do I have any alerts?" },
  { label: "News", message: "University news" },
];

const FACULTY_ACTIONS = [
  { label: "My Courses", message: "Show my courses" },
  { label: "Absence Report", message: "Students exceeding absence limit" },
  { label: "News", message: "University news" },
];

export default function QuickActions({ role, onSelect }) {
  const actions = role === "faculty" ? FACULTY_ACTIONS : STUDENT_ACTIONS;

  return (
    <div className="flex flex-wrap gap-2 justify-center py-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onSelect(action.message)}
          className="px-3.5 py-1.5 bg-sara-50 hover:bg-sara-100 border border-sara-200 text-sara-700 text-xs font-medium rounded-full transition-all hover:shadow-sm active:scale-95"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
