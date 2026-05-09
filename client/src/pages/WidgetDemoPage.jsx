import { useState, useEffect } from "react";
import ChatWidget from "../components/ChatWidget";
import { login as apiLogin, setToken, getToken } from "../services/api";

const API = "/api";

async function fetchAPI(path) {
  const res = await fetch(API + path, { headers: { Authorization: "Bearer " + getToken() } });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const txt = {
  ar: {
    dir: "rtl", portalName: "\u0627\u0644\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629 \u2014 \u0646\u0638\u0627\u0645 \u062a\u062c\u0631\u064a\u0628\u064a", portalShort: "\u0627\u0644\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629",
    login: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644", logout: "\u062e\u0631\u0648\u062c", username: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645", password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    loginBtn: "\u062f\u062e\u0648\u0644", loading: "\u062c\u0627\u0631\u064a \u0627\u0644\u062f\u062e\u0648\u0644...", invalidCreds: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629",
    enterCreds: "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", demoAccounts: "\u062d\u0633\u0627\u0628\u0627\u062a \u062a\u062c\u0631\u064a\u0628\u064a\u0629",
    studentDemo: "\u0637\u0627\u0644\u0628", facultyDemo: "\u0623\u0633\u062a\u0627\u0630",
    welcome: "\u0645\u0631\u062d\u0628\u0627\u064b", student: "\u0637\u0627\u0644\u0628", faculty: "\u0639\u0636\u0648 \u0647\u064a\u0626\u0629 \u062a\u062f\u0631\u064a\u0633",
    overview: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", grades: "\u0627\u0644\u062f\u0631\u062c\u0627\u062a", schedule: "\u0627\u0644\u062c\u062f\u0648\u0644",
    plan: "\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629", absences: "\u0627\u0644\u063a\u064a\u0627\u0628",
    alerts: "\u0627\u0644\u062a\u0646\u0628\u064a\u0647\u0627\u062a", news: "\u0627\u0644\u0623\u062e\u0628\u0627\u0631",
    courses: "\u0627\u0644\u0645\u0642\u0631\u0631\u0627\u062a", excessiveAbs: "\u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u063a\u064a\u0627\u0628",
    gpa: "\u0627\u0644\u0645\u0639\u062f\u0644 \u0627\u0644\u062a\u0631\u0627\u0643\u0645\u064a", outOf4: "\u0645\u0646 4.0",
    registeredCourses: "\u0645\u0648\u0627\u062f \u0645\u0633\u062c\u0644\u0629", thisSemester: "\u0647\u0630\u0627 \u0627\u0644\u0641\u0635\u0644",
    totalAbsences: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u063a\u064a\u0627\u0628", unread: "\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629",
    course: "\u0627\u0644\u0645\u0627\u062f\u0629", midterm: "\u0646\u0635\u0641\u064a", final: "\u0646\u0647\u0627\u0626\u064a",
    assignments: "\u0623\u0639\u0645\u0627\u0644", total: "\u0627\u0644\u0645\u062c\u0645\u0648\u0639", grade: "\u0627\u0644\u062a\u0642\u062f\u064a\u0631",
    creditHrs: "\u0633\u0627\u0639\u0627\u062a", day: "\u0627\u0644\u064a\u0648\u0645", time: "\u0627\u0644\u0648\u0642\u062a",
    room: "\u0627\u0644\u0642\u0627\u0639\u0629", instructor: "\u0627\u0644\u0645\u062d\u0627\u0636\u0631",
    completed: "\u0645\u0643\u062a\u0645\u0644\u0629", inProgress: "\u0642\u064a\u062f \u0627\u0644\u062a\u0646\u0641\u064a\u0630", remaining: "\u0645\u062a\u0628\u0642\u064a\u0629",
    todaySchedule: "\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645", noClassesToday: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u062d\u0627\u0636\u0631\u0627\u062a \u0627\u0644\u064a\u0648\u0645",
    universityNews: "\u0623\u062e\u0628\u0627\u0631 \u0627\u0644\u062c\u0627\u0645\u0639\u0629",
    date: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e", reason: "\u0627\u0644\u0633\u0628\u0628", noReason: "\u0628\u062f\u0648\u0646 \u0633\u0628\u0628",
    enrolledStudents: "\u0637\u0627\u0644\u0628 \u0645\u0633\u062c\u0644",
    studentsExceeding: "\u0637\u0644\u0627\u0628 \u0645\u062a\u062c\u0627\u0648\u0632\u064a\u0646 \u062d\u062f \u0627\u0644\u063a\u064a\u0627\u0628",
    absenceCount: "\u0639\u062f\u062f \u0627\u0644\u063a\u064a\u0627\u0628\u0627\u062a", myCourses: "\u0645\u0642\u0631\u0631\u0627\u062a\u064a",
    loadingData: "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644...", noData: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a",
  },
  en: {
    dir: "ltr", portalName: "Academic Portal \u2014 Demo System", portalShort: "Academic Portal",
    login: "Login", logout: "Logout", username: "Username", password: "Password",
    loginBtn: "Login", loading: "Logging in...", invalidCreds: "Invalid credentials",
    enterCreds: "Please enter credentials", demoAccounts: "Demo accounts",
    studentDemo: "Student", facultyDemo: "Faculty",
    welcome: "Welcome", student: "Student", faculty: "Faculty",
    overview: "Overview", grades: "Grades", schedule: "Schedule",
    plan: "Academic Plan", absences: "Absences", alerts: "Alerts", news: "News",
    courses: "Courses", excessiveAbs: "Excessive Absences",
    gpa: "GPA", outOf4: "out of 4.0", registeredCourses: "Registered Courses",
    thisSemester: "this semester", totalAbsences: "Total Absences", unread: "unread",
    course: "Course", midterm: "Midterm", final: "Final", assignments: "Assignments",
    total: "Total", grade: "Grade", creditHrs: "Credits",
    day: "Day", time: "Time", room: "Room", instructor: "Instructor",
    completed: "Completed", inProgress: "In Progress", remaining: "Remaining",
    todaySchedule: "Today's Schedule", noClassesToday: "No classes today",
    universityNews: "University News", date: "Date", reason: "Reason", noReason: "No reason",
    enrolledStudents: "enrolled", studentsExceeding: "Students Exceeding Absence Limit",
    absenceCount: "Absences", myCourses: "My Courses",
    loadingData: "Loading...", noData: "No data available",
  },
};

const Ic = ({ d, s = 20, c = "currentColor" }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>);
const icons = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z",
  grade: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6M9 14l2 2 4-4",
  cal: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  plan: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  absence: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  news: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 18L18 6M6 6l12 12",
  out: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  acad: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
};

function LoginScreen({ onLogin, lang, setLang }) {
  const t = txt[lang];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); if (!username || !password) { setError(t.enterCreds); return; } setLoading(true); setError(""); try { const data = await apiLogin(username, password); onLogin(data); } catch { setError(t.invalidCreds); } finally { setLoading(false); } };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-emerald-50 via-white to-emerald-100 px-4" dir={t.dir} style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
      <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-sm"><Ic d={icons.globe} s={14} c="#166534" />{lang === "ar" ? "EN" : "\u0639\u0631\u0628\u064a"}</button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-900 rounded-2xl mb-4 shadow-lg"><svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icons.acad} /></svg></div><h1 className="text-2xl font-bold text-emerald-900">{t.portalShort}</h1><p className="text-emerald-600 text-sm mt-1">{t.portalName}</p></div>
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">{t.login}</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">{t.username}</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" dir="ltr" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">{t.password}</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" dir="ltr" /></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-300 text-white font-medium rounded-xl transition-colors">{loading ? t.loading : t.loginBtn}</button>
          </form>
          <div className="mt-5 pt-4 border-t border-gray-100"><p className="text-xs text-gray-400 mb-2 text-center">{t.demoAccounts}</p><div className="grid grid-cols-2 gap-2 text-xs"><button onClick={() => { setUsername("441001"); setPassword("student123"); }} className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors">{t.studentDemo}: 441001</button><button onClick={() => { setUsername("dr.omar"); setPassword("faculty123"); }} className="p-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-700 transition-colors">{t.facultyDemo}: dr.omar</button></div></div>
        </div>
      </div>
    </div>
  );
}

function Portal({ authData, onLogout, lang, setLang }) {
  const { token, user } = authData;
  const t = txt[lang];
  const [grades, setGrades] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [absences, setAbsences] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [news, setNews] = useState(null);
  const [plan, setPlan] = useState(null);
  const [facCourses, setFacCourses] = useState(null);
  const [excessiveAbs, setExcessiveAbs] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user.role === "student") { fetchAPI("/grades").then(setGrades).catch(()=>{}); fetchAPI("/schedule").then(d=>setSchedule(d.schedule)).catch(()=>{}); fetchAPI("/absences").then(d=>setAbsences(d.absences)).catch(()=>{}); fetchAPI("/alerts").then(setAlerts).catch(()=>{}); fetchAPI("/news").then(d=>setNews(d.news)).catch(()=>{}); fetchAPI("/plan").then(setPlan).catch(()=>{}); }
    else { fetchAPI("/faculty/courses").then(d=>setFacCourses(d.courses)).catch(()=>{}); fetchAPI("/faculty/absences/excessive").then(setExcessiveAbs).catch(()=>{}); fetchAPI("/news").then(d=>setNews(d.news)).catch(()=>{}); }
  }, [user]);

  const totalAbs = absences?.reduce((s,c)=>s+c.totalAbsences,0)||0;
  const gc = g => { if(!g) return "text-gray-400"; if(g.startsWith("A")) return "text-emerald-600 font-bold"; if(g.startsWith("B")) return "text-blue-600 font-bold"; if(g.startsWith("C")) return "text-amber-600 font-bold"; return "text-red-600 font-bold"; };
  const studentTabs = [{id:"overview",label:t.overview,icon:icons.home},{id:"grades",label:t.grades,icon:icons.grade},{id:"schedule",label:t.schedule,icon:icons.cal},{id:"absences",label:t.absences,icon:icons.absence},{id:"plan",label:t.plan,icon:icons.plan},{id:"alerts",label:t.alerts,icon:icons.bell},{id:"news",label:t.news,icon:icons.news}];
  const facultyTabs = [{id:"overview",label:t.overview,icon:icons.home},{id:"courses",label:t.myCourses,icon:icons.plan},{id:"excessiveAbs",label:t.excessiveAbs,icon:icons.absence},{id:"news",label:t.news,icon:icons.news}];
  const tabs = user.role==="student"?studentTabs:facultyTabs;
  const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayAr={Sunday:"\u0627\u0644\u0623\u062d\u062f",Monday:"\u0627\u0644\u0627\u062b\u0646\u064a\u0646",Tuesday:"\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621",Wednesday:"\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621",Thursday:"\u0627\u0644\u062e\u0645\u064a\u0633",Friday:"\u0627\u0644\u062c\u0645\u0639\u0629",Saturday:"\u0627\u0644\u0633\u0628\u062a"};
  const dayName=(d)=>lang==="ar"?dayAr[d]||d:d;
  const today=days[new Date().getDay()];
  const todayClasses=schedule?.filter(s=>s.dayOfWeek===today)||[];

  return (
    <div className="min-h-screen bg-gray-100 flex" dir={t.dir} style={{fontFamily:"IBM Plex Sans Arabic, sans-serif"}}>
      <aside className={`${sidebarOpen?"w-48":"w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white min-h-screen z-30`}>
        <div className="w-48">
          <div className="px-3 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icons.acad}/></svg></div><p className="text-[11px] font-bold">{t.portalShort}</p></div>
            <button onClick={()=>setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded"><Ic d={icons.x} s={14} c="rgba(255,255,255,0.6)"/></button>
          </div>
          <nav className="py-2 px-1.5 space-y-0.5">{tabs.map(tab=>(<button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${activeTab===tab.id?"bg-white/15 text-white font-semibold border-s-2 border-white":"text-white/70 hover:text-white hover:bg-white/5"}`}><Ic d={tab.icon} s={15} c={activeTab===tab.id?"#fff":"rgba(255,255,255,0.5)"}/>{tab.label}{tab.id==="alerts"&&alerts?.unreadCount>0&&(<span className="ms-auto w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">{alerts.unreadCount}</span>)}</button>))}</nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen&&<button onClick={()=>setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Ic d={icons.menu} s={18} c="#374151"/></button>}
            <span className="text-sm text-gray-500">{t.welcome}, <strong className="text-gray-800">{lang==="en"?(user.nameEn||user.nameAr):user.nameAr}</strong></span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.role==="student"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{user.role==="student"?t.student:t.faculty}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setLang(lang==="ar"?"en":"ar")} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100"><Ic d={icons.globe} s={13} c="#166534"/>{lang==="ar"?"EN":"\u0639\u0631\u0628\u064a"}</button>
            <button onClick={onLogout} className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs"><Ic d={icons.out} s={14} c="#dc2626"/>{t.logout}</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">

          {user.role==="student"&&activeTab==="overview"&&(<div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm"><p className="text-xs text-gray-500 mb-1">{t.gpa}</p><p className="text-2xl font-bold text-emerald-700">{grades?.gpa?.gpa??"..."}</p><p className="text-[10px] text-gray-400">{t.outOf4}</p></div>
              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm"><p className="text-xs text-gray-500 mb-1">{t.registeredCourses}</p><p className="text-2xl font-bold text-blue-700">{grades?.grades?.length??"..."}</p><p className="text-[10px] text-gray-400">{t.thisSemester}</p></div>
              <div className={`bg-white rounded-xl border p-4 shadow-sm ${totalAbs>4?"border-red-200":"border-amber-200"}`}><p className="text-xs text-gray-500 mb-1">{t.totalAbsences}</p><p className={`text-2xl font-bold ${totalAbs>4?"text-red-600":"text-amber-600"}`}>{totalAbs}</p><p className="text-[10px] text-gray-400">{t.thisSemester}</p></div>
              <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm"><p className="text-xs text-gray-500 mb-1">{t.alerts}</p><p className="text-2xl font-bold text-red-600">{alerts?.unreadCount??"..."}</p><p className="text-[10px] text-gray-400">{t.unread}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.grades}</h3>
                {grades?.grades?.map(g=>(<div key={g.courseCode} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"><div><p className="text-sm text-gray-800">{lang==="ar"?g.courseNameAr:g.courseNameEn||g.courseNameAr}</p><p className="text-[11px] text-gray-400">{g.courseCode} {g.creditHours} {t.creditHrs}</p></div><div className="text-left"><span className={`text-sm ${gc(g.letterGrade)}`}>{g.letterGrade}</span><p className="text-[11px] text-gray-400">{g.total}/100</p></div></div>))||<p className="text-sm text-gray-400">{t.loadingData}</p>}
                {grades?.gpa&&<div className="mt-3 pt-3 border-t border-gray-100 text-sm">{t.gpa}: <span className="font-bold text-emerald-700">{grades.gpa.gpa}</span> / 4.0 ({grades.gpa.totalCredits} {t.creditHrs})</div>}
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><h3 className="text-sm font-semibold text-gray-800 mb-3">{t.todaySchedule}</h3>{schedule?(todayClasses.length>0?todayClasses.map((s,i)=>(<div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"><div className="w-12 text-center"><p className="text-xs font-mono text-emerald-700">{s.startTime}</p><p className="text-[9px] text-gray-400">{s.endTime}</p></div><div><p className="text-xs text-gray-800">{lang==="ar"?s.courseNameAr:s.courseCode}</p><p className="text-[10px] text-gray-400">{t.room}: {s.room}</p></div></div>)):<p className="text-xs text-gray-400">{t.noClassesToday}</p>):<p className="text-xs text-gray-400">{t.loadingData}</p>}</div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><h3 className="text-sm font-semibold text-gray-800 mb-3">{t.universityNews}</h3>{news?.map(n=>(<div key={n.id} className="py-2 border-b border-gray-100 last:border-0"><p className="text-xs font-medium text-gray-800">{lang==="ar"?n.titleAr:n.titleEn||n.titleAr}</p><p className="text-[10px] text-gray-400 mt-0.5">{n.category}</p></div>))||<p className="text-xs text-gray-400">{t.loadingData}</p>}</div>
                {alerts?.alerts?.length>0&&(<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><h3 className="text-sm font-semibold text-gray-800 mb-3">{t.alerts}</h3>{alerts.alerts.slice(0,3).map(a=>(<div key={a.id} className={`p-2.5 rounded-lg mb-2 last:mb-0 text-xs ${a.type==="urgent"?"bg-red-50 border border-red-200":a.type==="warning"?"bg-amber-50 border border-amber-200":"bg-blue-50 border border-blue-200"}`}><p className="font-semibold text-gray-800">{lang==="ar"?a.title:a.titleEn||a.title}</p><p className="text-gray-600 mt-0.5 text-[11px]">{lang==="ar"?a.body:a.bodyEn||a.body}</p></div>))}</div>)}
              </div>
            </div>
          </div>)}

          {user.role==="student"&&activeTab==="grades"&&(<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"><div className="px-5 py-3 border-b border-gray-100 bg-emerald-50"><h2 className="text-sm font-semibold text-emerald-900">{t.grades}</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3 text-start font-medium">{t.course}</th><th className="px-4 py-3 text-center font-medium">{t.midterm}</th><th className="px-4 py-3 text-center font-medium">{t.final}</th><th className="px-4 py-3 text-center font-medium">{t.assignments}</th><th className="px-4 py-3 text-center font-medium">{t.total}</th><th className="px-4 py-3 text-center font-medium">{t.grade}</th></tr></thead><tbody>{grades?.grades?.map(g=>(<tr key={g.courseCode} className="border-t border-gray-100 hover:bg-gray-50/50"><td className="px-4 py-3"><p className="font-medium text-gray-800">{lang==="ar"?g.courseNameAr:g.courseCode}</p><p className="text-[11px] text-gray-400">{g.courseCode} {g.creditHours} {t.creditHrs}</p></td><td className="px-4 py-3 text-center">{g.midterm}</td><td className="px-4 py-3 text-center">{g.final}</td><td className="px-4 py-3 text-center">{g.assignments}</td><td className="px-4 py-3 text-center font-semibold">{g.total}</td><td className={`px-4 py-3 text-center ${gc(g.letterGrade)}`}>{g.letterGrade}</td></tr>))}</tbody></table></div>{grades?.gpa&&<div className="px-5 py-3 bg-emerald-50 border-t text-sm">{t.gpa}: <span className="font-bold text-emerald-700">{grades.gpa.gpa}</span> / 4.0 ({grades.gpa.totalCredits} {t.creditHrs})</div>}</div>)}

          {user.role==="student"&&activeTab==="schedule"&&(<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"><div className="px-5 py-3 border-b border-gray-100 bg-emerald-50"><h2 className="text-sm font-semibold text-emerald-900">{t.schedule}</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3 text-start font-medium">{t.day}</th><th className="px-4 py-3 text-start font-medium">{t.time}</th><th className="px-4 py-3 text-start font-medium">{t.course}</th><th className="px-4 py-3 text-start font-medium">{t.room}</th><th className="px-4 py-3 text-start font-medium">{t.instructor}</th></tr></thead><tbody>{schedule?.map((s,i)=>(<tr key={i} className={`border-t border-gray-100 hover:bg-gray-50/50 ${s.dayOfWeek===today?"bg-emerald-50/40":""}`}><td className="px-4 py-3 font-medium">{dayName(s.dayOfWeek)}</td><td className="px-4 py-3 font-mono text-xs" dir="ltr">{s.startTime} - {s.endTime}</td><td className="px-4 py-3"><p className="text-gray-800">{lang==="ar"?s.courseNameAr:s.courseNameEn||s.courseCode}</p><p className="text-[11px] text-gray-400">{s.courseCode}</p></td><td className="px-4 py-3">{s.room}</td><td className="px-4 py-3 text-gray-600">{lang==="ar"?s.facultyNameAr:s.facultyNameEn||s.facultyNameAr}</td></tr>))}</tbody></table></div></div>)}

          {user.role==="student"&&activeTab==="absences"&&(<div className="space-y-3">{absences?.map(c=>(<div key={c.courseCode} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"><div className="flex items-center justify-between mb-3"><div><h3 className="text-sm font-semibold text-gray-800">{lang==="ar"?c.courseNameAr:c.courseNameEn||c.courseNameAr}</h3><p className="text-[11px] text-gray-400">{c.courseCode}</p></div><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.totalAbsences>=4?"bg-red-100 text-red-700":c.totalAbsences>=2?"bg-amber-100 text-amber-700":"bg-green-100 text-green-700"}`}>{c.totalAbsences} {t.absences}</span></div><div className="space-y-1.5">{c.records.map((r,i)=>(<div key={i} className="flex justify-between items-center text-xs bg-gray-50 rounded-lg px-3 py-2"><span className="font-mono text-gray-700">{r.date}</span><span className="text-gray-500">{r.reason||t.noReason}</span></div>))}</div></div>))||<p className="text-sm text-gray-400 text-center py-10">{t.loadingData}</p>}</div>)}

          {user.role==="student"&&activeTab==="plan"&&plan&&(<div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{plan.summary.completed}</p><p className="text-xs text-emerald-600">{t.completed}</p></div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-700">{plan.summary.inProgress}</p><p className="text-xs text-blue-600">{t.inProgress}</p></div>
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-gray-700">{plan.summary.remaining}</p><p className="text-xs text-gray-600">{t.remaining}</p></div>
            </div>
            {plan.inProgress.length>0&&<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"><h3 className="text-sm font-semibold text-blue-700 mb-3">{t.inProgress}</h3>{plan.inProgress.map(c=>(<div key={c.courseCode} className="flex justify-between items-center p-2.5 rounded-lg mb-1.5 bg-blue-50 border border-blue-100"><div><p className="text-sm text-gray-800">{lang==="ar"?c.courseNameAr:c.courseNameEn||c.courseNameAr}</p><p className="text-[11px] text-gray-400">{c.courseCode}</p></div><span className="text-[11px] text-blue-600 font-medium">{c.semester}</span></div>))}</div>}
            {plan.completed.length>0&&<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"><h3 className="text-sm font-semibold text-emerald-700 mb-3">{t.completed}</h3>{plan.completed.map(c=>(<div key={c.courseCode} className="flex justify-between items-center p-2.5 rounded-lg mb-1.5 bg-emerald-50 border border-emerald-100"><div><p className="text-sm text-gray-800">{lang==="ar"?c.courseNameAr:c.courseNameEn||c.courseNameAr}</p><p className="text-[11px] text-gray-400">{c.courseCode}</p></div><span className="text-[11px] text-emerald-600 font-medium">{c.semester}</span></div>))}</div>}
            {plan.remaining.length>0&&<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"><h3 className="text-sm font-semibold text-gray-700 mb-3">{t.remaining}</h3>{plan.remaining.map(c=>(<div key={c.courseCode} className="flex justify-between items-center p-2.5 rounded-lg mb-1.5 bg-gray-50 border border-gray-200"><div><p className="text-sm text-gray-800">{lang==="ar"?c.courseNameAr:c.courseNameEn||c.courseNameAr}</p><p className="text-[11px] text-gray-400">{c.courseCode}</p></div><span className="text-[11px] text-gray-500 font-medium">{c.semester}</span></div>))}</div>}
          </div>)}

          {user.role==="student"&&activeTab==="alerts"&&(<div className="space-y-3">{alerts?.alerts?.map(a=>(<div key={a.id} className={`bg-white rounded-xl border shadow-sm p-5 ${a.type==="urgent"?"border-red-300 border-l-4":a.type==="warning"?"border-amber-300 border-l-4":"border-blue-300 border-l-4"}`}><p className="text-sm font-semibold text-gray-800">{lang==="ar"?a.title:a.titleEn||a.title}</p><p className="text-xs text-gray-600 mt-1">{lang==="ar"?a.body:a.bodyEn||a.body}</p><p className="text-[10px] text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString(lang==="ar"?"ar-SA":"en-US")}</p></div>))||<p className="text-sm text-gray-400 text-center py-10">{t.loadingData}</p>}</div>)}

          {activeTab==="news"&&(<div className="space-y-3">{news?.map(n=>(<div key={n.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"><div className="flex items-center gap-2 mb-2"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${n.category==="announcement"?"bg-blue-100 text-blue-700":n.category==="competition"?"bg-amber-100 text-amber-700":"bg-gray-100 text-gray-700"}`}>{n.category}</span><span className="text-[10px] text-gray-400">{new Date(n.publishedAt).toLocaleDateString(lang==="ar"?"ar-SA":"en-US")}</span></div><h3 className="text-sm font-semibold text-gray-800">{lang==="ar"?n.titleAr:n.titleEn||n.titleAr}</h3><p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{lang==="ar"?n.bodyAr:n.bodyEn||n.bodyAr}</p></div>))||<p className="text-sm text-gray-400 text-center py-10">{t.loadingData}</p>}</div>)}

          {user.role==="faculty"&&activeTab==="overview"&&(<div className="space-y-4">
            <div className="grid grid-cols-2 gap-3"><div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm"><p className="text-xs text-gray-500 mb-1">{t.myCourses}</p><p className="text-2xl font-bold text-emerald-700">{facCourses?.length??"..."}</p></div><div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm"><p className="text-xs text-gray-500 mb-1">{t.excessiveAbs}</p><p className="text-2xl font-bold text-red-600">{excessiveAbs?.students?.length??"..."}</p></div></div>
            {facCourses&&<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"><h3 className="text-sm font-semibold text-gray-800 mb-3">{t.myCourses}</h3>{facCourses.map(c=>(<div key={c.code} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0"><div><p className="text-sm text-gray-800">{lang==="ar"?c.nameAr:c.nameEn||c.nameAr}</p><p className="text-[11px] text-gray-400">{c.code} {c.creditHours} {t.creditHrs}</p></div><span className="text-xs text-emerald-600 font-medium">{c.enrolledStudents} {t.enrolledStudents}</span></div>))}</div>}
            {excessiveAbs?.students?.length>0&&<div className="bg-white rounded-xl border border-red-200 p-5 shadow-sm"><h3 className="text-sm font-semibold text-red-700 mb-3">{t.studentsExceeding}</h3>{excessiveAbs.students.map((s,i)=>(<div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-red-50 border border-red-100 mb-2 last:mb-0"><div><p className="text-sm text-gray-800">{lang==="ar"?s.student.nameAr:s.student.nameEn||s.student.nameAr}</p><p className="text-[11px] text-gray-400">{lang==="ar"?s.course.nameAr:s.course.nameEn||s.course.nameAr} ({s.course.code})</p></div><span className="text-sm font-bold text-red-600">{s.absenceCount}</span></div>))}</div>}
          </div>)}

          {user.role==="faculty"&&activeTab==="courses"&&(<div className="space-y-3">{facCourses?.map(c=>(<div key={c.code+c.enrolledStudents} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"><div className="flex justify-between items-start mb-3"><div><h3 className="text-sm font-semibold text-gray-800">{lang==="ar"?c.nameAr:c.nameEn||c.nameAr}</h3><p className="text-[11px] text-gray-400">{c.code} {c.creditHours} {t.creditHrs}</p></div><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">{c.enrolledStudents} {t.enrolledStudents}</span></div><div className="flex flex-wrap gap-2">{c.schedule.map((s,i)=>(<span key={i} className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded text-[11px] text-gray-600">{s.day} {s.startTime}-{s.endTime} {s.room}</span>))}</div></div>))||<p className="text-sm text-gray-400 text-center py-10">{t.loadingData}</p>}</div>)}

          {user.role==="faculty"&&activeTab==="excessiveAbs"&&(<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"><div className="px-5 py-3 border-b border-gray-100 bg-red-50"><h2 className="text-sm font-semibold text-red-800">{t.studentsExceeding}</h2></div>{excessiveAbs?.students?.length>0?(<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3 text-start font-medium">{t.student}</th><th className="px-4 py-3 text-start font-medium">{t.course}</th><th className="px-4 py-3 text-center font-medium">{t.absenceCount}</th></tr></thead><tbody>{excessiveAbs.students.map((s,i)=>(<tr key={i} className="border-t border-gray-100 hover:bg-red-50/30"><td className="px-4 py-3"><p className="font-medium text-gray-800">{lang==="ar"?s.student.nameAr:s.student.nameEn||s.student.nameAr}</p><p className="text-[11px] text-gray-400">{s.student.id}</p></td><td className="px-4 py-3"><p className="text-gray-800">{lang==="ar"?s.course.nameAr:s.course.nameEn||s.course.nameAr}</p><p className="text-[11px] text-gray-400">{s.course.code}</p></td><td className="px-4 py-3 text-center"><span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-bold">{s.absenceCount}</span></td></tr>))}</tbody></table></div>):<p className="text-sm text-gray-400 text-center py-10">{t.noData}</p>}</div>)}

        </main>
      </div>
      <ChatWidget token={token} user={user} lang={lang} />
    </div>
  );
}

export default function WidgetDemoPage() {
  const [authData, setAuthData] = useState(null);
  const [lang, setLang] = useState("en");
  const handleLogout = () => { setAuthData(null); };
  if (!authData) return <LoginScreen onLogin={setAuthData} lang={lang} setLang={setLang} />;
  return <Portal authData={authData} onLogout={handleLogout} lang={lang} setLang={setLang} />;
}
