// ==============================================
// SARA — Demo Questions Test Script
// Tests all showcase questions for student & faculty
// ==============================================

const BASE = "http://localhost:3001/api";

async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Login failed for ${username}: ${JSON.stringify(data)}`);
  return data.token;
}

async function chat(token, message) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

function truncate(text, max = 120) {
  if (!text) return "(no reply)";
  const oneLine = text.replace(/\n/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "..." : oneLine;
}

// Delay to respect Gemini rate limit (2 tool-calling questions/min)
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ==============================================
// Test definitions
// ==============================================
const STUDENT_QUESTIONS = [
  { q: "What's my GPA?", expect: "grades/GPA", type: "basic" },
  { q: "Am I failing any course?", expect: "AI analysis of grades", type: "analysis" },
  { q: "Show me my grades, absences, and schedule", expect: "multi-tool call", type: "multi" },
  { q: "How did I do in CS101?", expect: "filtered by course", type: "filter" },
  { q: "What are my unread alerts?", expect: "unread alerts only", type: "filter" },
  { q: "What's the latest university news?", expect: "news list", type: "basic" },
  { q: "Which day do I have the most classes?", expect: "schedule analysis", type: "analysis" },
  { q: "Am I at risk of being denied from any course?", expect: "absence risk analysis", type: "analysis" },
  { q: "Delete my absences", expect: "WRITE REJECTED", type: "security" },
];

const STUDENT_ARABIC_QUESTIONS = [
  { q: "\u0648\u0634 \u0645\u0639\u062f\u0644\u064a", expect: "GPA in Arabic dialect", type: "dialect" },
  { q: "\u0643\u0645 \u0628\u0627\u0642\u064a \u0639\u0644\u0649 \u062a\u062e\u0631\u062c\u064a\u061f", expect: "graduation plan", type: "dialect" },
  { q: "\u0647\u0644 \u0623\u0646\u0627 \u0642\u0631\u064a\u0628 \u0645\u0646 \u0627\u0644\u062d\u0631\u0645\u0627\u0646 \u0641\u064a \u0623\u064a \u0645\u0627\u062f\u0629\u061f", expect: "absence risk", type: "dialect" },
];

const FACULTY_QUESTIONS = [
  { q: "What courses am I teaching?", expect: "faculty courses", type: "basic" },
  { q: "Show me the students in CS101", expect: "course roster", type: "filter" },
  { q: "Who are my at-risk students?", expect: "excessive absences", type: "analysis" },
  { q: "How many students do I have in total?", expect: "total count", type: "analysis" },
  { q: "Change a student's grade", expect: "WRITE REJECTED", type: "security" },
];

const CROSS_ROLE_TESTS = [
  { as: "student", q: "Show me faculty courses", expect: "FORBIDDEN or unknown" },
  { as: "faculty", q: "What's my GPA?", expect: "FORBIDDEN or unknown" },
];

// ==============================================
// Runner
// ==============================================
async function run() {
  console.log("=".repeat(60));
  console.log("  SARA Demo Questions Test");
  console.log("=".repeat(60));

  // Login
  console.log("\n[LOGIN] Logging in...");
  const studentToken = await login("441001", "student123");
  const facultyToken = await login("dr.omar", "faculty123");
  console.log("  Student (441001): OK");
  console.log("  Faculty (dr.omar): OK");

  let passed = 0;
  let failed = 0;
  let total = 0;

  // --- Student English questions ---
  console.log("\n" + "=".repeat(60));
  console.log("  STUDENT QUESTIONS (English)");
  console.log("=".repeat(60));

  for (const t of STUDENT_QUESTIONS) {
    total++;
    console.log(`\n[Q${total}] ${t.q}`);
    console.log(`     Expected: ${t.expect} | Type: ${t.type}`);
    try {
      const result = await chat(studentToken, t.q);
      const reply = result.reply || result.error || JSON.stringify(result);
      const intent = result.intent || "?";

      // Check pass/fail
      let ok = false;
      if (t.type === "security") {
        ok = /read.only|sorry|cannot|not allowed|write.rejected|student affairs/i.test(reply);
      } else {
        ok = reply.length > 20 && !/didn't understand|not available|error/i.test(reply);
      }

      console.log(`     Intent: ${intent}`);
      console.log(`     Reply: ${truncate(reply)}`);
      console.log(`     ${ok ? "PASS" : "FAIL"}`);
      ok ? passed++ : failed++;
    } catch (err) {
      console.log(`     ERROR: ${err.message}`);
      failed++;
    }
    await delay(2500); // rate limit
  }

  // --- Student Arabic questions ---
  console.log("\n" + "=".repeat(60));
  console.log("  STUDENT QUESTIONS (Arabic Dialect)");
  console.log("=".repeat(60));

  for (const t of STUDENT_ARABIC_QUESTIONS) {
    total++;
    console.log(`\n[Q${total}] ${t.q}`);
    console.log(`     Expected: ${t.expect} | Type: ${t.type}`);
    try {
      const result = await chat(studentToken, t.q);
      const reply = result.reply || result.error || JSON.stringify(result);
      const intent = result.intent || "?";
      const ok = reply.length > 20 && !/didn't understand|error/i.test(reply);

      console.log(`     Intent: ${intent}`);
      console.log(`     Reply: ${truncate(reply)}`);
      console.log(`     ${ok ? "PASS" : "FAIL"}`);
      ok ? passed++ : failed++;
    } catch (err) {
      console.log(`     ERROR: ${err.message}`);
      failed++;
    }
    await delay(2500);
  }

  // --- Faculty questions ---
  console.log("\n" + "=".repeat(60));
  console.log("  FACULTY QUESTIONS");
  console.log("=".repeat(60));

  for (const t of FACULTY_QUESTIONS) {
    total++;
    console.log(`\n[Q${total}] ${t.q}`);
    console.log(`     Expected: ${t.expect} | Type: ${t.type}`);
    try {
      const result = await chat(facultyToken, t.q);
      const reply = result.reply || result.error || JSON.stringify(result);
      const intent = result.intent || "?";

      let ok = false;
      if (t.type === "security") {
        ok = /read.only|sorry|cannot|not allowed|write.rejected|student affairs/i.test(reply);
      } else {
        ok = reply.length > 20 && !/didn't understand|not available|error/i.test(reply);
      }

      console.log(`     Intent: ${intent}`);
      console.log(`     Reply: ${truncate(reply)}`);
      console.log(`     ${ok ? "PASS" : "FAIL"}`);
      ok ? passed++ : failed++;
    } catch (err) {
      console.log(`     ERROR: ${err.message}`);
      failed++;
    }
    await delay(2500);
  }

  // --- Cross-role security tests ---
  console.log("\n" + "=".repeat(60));
  console.log("  CROSS-ROLE SECURITY TESTS");
  console.log("=".repeat(60));

  for (const t of CROSS_ROLE_TESTS) {
    total++;
    const token = t.as === "student" ? studentToken : facultyToken;
    console.log(`\n[Q${total}] [as ${t.as}] ${t.q}`);
    console.log(`     Expected: ${t.expect}`);
    try {
      const result = await chat(token, t.q);
      const reply = result.reply || result.error || JSON.stringify(result);
      const intent = result.intent || "?";
      // Cross-role should NOT return real data from the other role
      const ok = !/here are your|your grades|your courses/i.test(reply) || /forbidden|not available|unknown|didn't understand/i.test(reply);

      console.log(`     Intent: ${intent}`);
      console.log(`     Reply: ${truncate(reply)}`);
      console.log(`     ${ok ? "PASS" : "FAIL"}`);
      ok ? passed++ : failed++;
    } catch (err) {
      console.log(`     ERROR: ${err.message}`);
      failed++;
    }
    await delay(2500);
  }

  // --- Summary ---
  console.log("\n" + "=".repeat(60));
  console.log(`  RESULTS: ${passed}/${total} passed, ${failed} failed`);
  console.log("=".repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
