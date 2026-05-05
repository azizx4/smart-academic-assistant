import { useState, useRef, useEffect } from "react";
import { sendMessage, login as apiLogin, clearToken, setToken } from "../services/api";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

export default function ChatWidget({ token: externalToken, user: externalUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-login if token and user are provided externally
  useEffect(() => {
    if (externalToken && externalUser) {
      setToken(externalToken);
      setUser(externalUser);
      setIsLoggedIn(true);
      setMessages([{
        role: "assistant",
        content: "Hi " + (externalUser.nameEn || externalUser.nameAr) + "! I'm SARA, your academic assistant. How can I help you?"
      }]);
    }
  }, [externalToken, externalUser]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen && isLoggedIn) { inputRef.current?.focus(); setUnreadCount(0); } }, [isOpen, isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) { setLoginError("Please enter credentials"); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const data = await apiLogin(loginForm.username.trim(), loginForm.password);
      setUser(data.user); setIsLoggedIn(true);
      setMessages([{ role: "assistant", content: "Hi " + (data.user.nameEn || data.user.nameAr) + "! I'm SARA, your academic assistant. How can I help you?" }]);
    } catch (err) { setLoginError("Invalid credentials"); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = () => { clearToken(); setUser(null); setIsLoggedIn(false); setMessages([]); setLoginForm({ username: "", password: "" }); };

  const handleSend = async (text) => {
    const msg = text || input.trim(); if (!msg || isTyping) return;
    setMessages((p) => [...p, { role: "user", content: msg }]); setInput(""); setIsTyping(true);
    try {
      const data = await sendMessage(msg);
      setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch (err) {
      if (err.status === 401) { handleLogout(); return; }
      setMessages((p) => [...p, { role: "assistant", content: "Error occurred. Try again." }]);
    } finally { setIsTyping(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const quickActions = user?.role === "faculty"
    ? [{ label: "My courses", msg: "show my courses" }, { label: "Absence report", msg: "absence report" }, { label: "News", msg: "university news" }]
    : [{ label: "Grades", msg: "show my grades" }, { label: "Absences", msg: "show my absences" }, { label: "Schedule", msg: "show my schedule" }, { label: "Alerts", msg: "any alerts?" }];

  return (<>
    {!isOpen && (<button onClick={() => { setIsOpen(true); setUnreadCount(0); }} className="fixed bottom-5 left-5 z-[9999] w-14 h-14 bg-sara-600 hover:bg-sara-700 text-white rounded-full shadow-lg shadow-sara-300/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ direction: "ltr" }}>
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
      {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
    </button>)}

    {isOpen && (<div className="fixed bottom-5 left-5 z-[9999] w-[380px] h-[560px] max-h-[80vh] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-200 flex flex-col overflow-hidden" style={{ direction: "rtl" }}>
      <div className="bg-sara-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg></div>
          <div><p className="text-sm font-semibold leading-tight">SARA</p><p className="text-[10px] text-white/70">Academic Assistant</p></div>
        </div>
        <div className="flex items-center gap-1">
          {isLoggedIn && !externalToken && <button onClick={handleLogout} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg></button>}
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg></button>
        </div>
      </div>

      {!isLoggedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-12 h-12 bg-sara-100 rounded-xl flex items-center justify-center mb-4"><svg className="w-6 h-6 text-sara-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg></div>
          <p className="text-sm text-gray-600 mb-4">Login to start</p>
          {loginError && <div className="w-full mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">{loginError}</div>}
          <form onSubmit={handleLogin} className="w-full space-y-3">
            <input type="text" value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} placeholder="Username" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sara-400" dir="ltr" />
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sara-400" dir="ltr" />
            <button type="submit" disabled={loginLoading} className="w-full py-2.5 bg-sara-600 hover:bg-sara-700 disabled:bg-sara-300 text-white text-sm font-medium rounded-xl transition-colors">{loginLoading ? "Loading..." : "Login"}</button>
          </form>
          <div className="flex gap-2 mt-3 w-full">
            <button type="button" onClick={() => setLoginForm({ username: "441001", password: "student123" })} className="flex-1 p-2 bg-sara-50 hover:bg-sara-100 rounded-lg text-sara-700 text-[11px] transition-colors">Student</button>
            <button type="button" onClick={() => setLoginForm({ username: "dr.omar", password: "faculty123" })} className="flex-1 p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 text-[11px] transition-colors">Faculty</button>
          </div>
        </div>
      ) : (<>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        {messages.length <= 1 && <div className="px-3 pb-1 flex flex-wrap gap-1.5 justify-center">
          {quickActions.map((a) => <button key={a.label} onClick={() => handleSend(a.msg)} className="px-2.5 py-1 bg-sara-50 hover:bg-sara-100 border border-sara-200 text-sara-700 text-[11px] rounded-full transition-all">{a.label}</button>)}
        </div>}
        <div className="border-t border-gray-100 px-3 py-2.5 flex items-end gap-2 flex-shrink-0">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask a question..." rows={1} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sara-400" style={{ maxHeight: "80px" }} onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"; }} />
          <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="p-2.5 bg-sara-600 hover:bg-sara-700 disabled:bg-gray-200 text-white rounded-xl transition-colors active:scale-95"><svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg></button>
        </div>
      </>)}
    </div>)}
  </>);
}
