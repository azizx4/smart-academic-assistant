// ==============================================
// SARA — Chat Page
// Main conversation interface
// ==============================================

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { sendMessage } from "../services/api";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";
import QuickActions from "../components/QuickActions";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    const name = user.nameEn || user.nameAr;
    const welcome =
      user.role === "student"
        ? `Hi ${name}! I'm SARA, your academic assistant. How can I help you?`
        : `Hi ${name}! I'm SARA. I can help you view your courses and absence reports.`;

    setMessages([{ role: "assistant", content: welcome }]);
  }, [user]);

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setInput("");
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      const data = await sendMessage(messageText);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, an error occurred while processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const roleBadge =
    user.role === "student"
      ? { text: "Student", color: "bg-sara-100 text-sara-700" }
      : { text: "Faculty", color: "bg-gold-50 text-gold-600" };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-sara-50/50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sara-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sara-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-sara-800 leading-tight">SARA</h1>
            <p className="text-[11px] text-gray-400">Academic Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${roleBadge.color}`}>
            {roleBadge.text}
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">{user.nameEn || user.nameAr}</span>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="max-w-2xl mx-auto">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && messages.length <= 1 && (
        <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
          <QuickActions role={user.role} onSelect={handleSend} />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-sara-100 bg-white/80 backdrop-blur-md px-4 py-3 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-sara-400 focus:border-transparent transition-all"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-sara-600 hover:bg-sara-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl transition-colors shadow-sm active:scale-95"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-2">
          SARA — Read-only system • Data cannot be modified
        </p>
      </div>
    </div>
  );
}
