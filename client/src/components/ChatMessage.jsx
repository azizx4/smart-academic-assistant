// ==============================================
// SARA — Chat Message Component
// ==============================================

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`msg-animate flex ${isUser ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-sara-600 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
