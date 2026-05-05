// ==============================================
// SARA — Typing Indicator
// ==============================================

export default function TypingIndicator() {
  return (
    <div className="flex justify-end mb-4 msg-animate">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-5 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
