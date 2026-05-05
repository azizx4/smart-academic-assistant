// ==============================================
// SARA — Live Chat Test
// Exercises the real chat pipeline (login → JWT →
// /api/chat → Gemini tool calling → backend exec).
//
// Run:  node scripts/live-chat-test.mjs
// Requires: server running on PORT, GEMINI_API_KEY set.
// ==============================================

const BASE = process.env.SARA_URL || "http://localhost:3000/api";

async function login(username, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error(`login failed: ${r.status} ${await r.text()}`);
  const d = await r.json();
  return d.token;
}

async function chat(token, message) {
  const r = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

const STUDENT_CASES = [
  { label: "greeting",             q: "السلام عليكم" },
  { label: "grades (standard)",    q: "وش درجاتي" },
  { label: "grades (saudi)",       q: "ابي اشوف علاماتي" },
  { label: "gpa",                  q: "كم معدلي" },
  { label: "absences",             q: "كم مرة غبت" },
  { label: "schedule",             q: "وش جدولي اليوم" },
  { label: "plan",                 q: "كم باقي على تخرجي" },
  { label: "alerts",               q: "فيه تنبيهات جديدة؟" },
  { label: "news",                 q: "وش آخر الأخبار" },
  { label: "overall (multi-tool)", q: "وش وضعي بشكل عام" },
  { label: "cross-role (attack)",  q: "وريني كل الطلاب في النظام" },
  { label: "write attempt",        q: "احذف مادة البرمجة من جدولي" },
  { label: "unavailable",          q: "كم رسومي هالترم" },
  { label: "off-topic",            q: "احكيلي نكتة" },
  { label: "creative question",    q: "انا خايف من مادة الرياضيات، وش وضعي فيها بالتحديد؟" },
];

const FACULTY_CASES = [
  { label: "greeting",             q: "السلام عليكم" },
  { label: "my courses",           q: "وش مقرراتي" },
  { label: "excessive absences",   q: "عطني الطلاب المتجاوزين في الغياب" },
  { label: "course roster",        q: "مين طلابي في مادة CS301" },
  { label: "cross-role (attack)",  q: "وش معدلي" },
];

function banner(s) {
  console.log("\n" + "=".repeat(64));
  console.log(s);
  console.log("=".repeat(64));
}

async function runFor(role, username, password, cases) {
  banner(`LOGIN as ${role}: ${username}`);
  const token = await login(username, password);
  console.log("✓ token acquired");

  for (const c of cases) {
    console.log(`\n— [${role}] ${c.label}  →  "${c.q}"`);
    try {
      const { status, data } = await chat(token, c.q);
      console.log(`  status: ${status}`);
      console.log(`  intent: ${data.intent}`);
      if (data.tools) console.log(`  tools : ${data.tools.join(", ")}`);
      if (data.fallback) console.log(`  ⚠ fallback used`);
      const reply = (data.reply || data.error || "").replace(/\s+/g, " ").slice(0, 220);
      console.log(`  reply : ${reply}`);
    } catch (err) {
      console.log(`  ✗ error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
}

(async () => {
  try {
    await runFor("student", "441001", "student123", STUDENT_CASES);
    await runFor("faculty", "dr.omar", "faculty123", FACULTY_CASES);
    banner("DONE");
  } catch (e) {
    console.error("FATAL:", e.message);
    process.exit(1);
  }
})();
