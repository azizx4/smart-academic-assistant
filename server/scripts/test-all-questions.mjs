// Test all 20 demo questions (10 student + 10 faculty)
const BASE = "http://localhost:3001";

async function login(username, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return data.token;
}

async function ask(token, message) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const studentQuestions = [
  // Normal
  "What are my grades?",
  "How many absences do I have?",
  "Show me my schedule",
  "Any university news?",
  "Do I have any alerts?",
  // Wow
  "Show me my grades, absences, and schedule all at once",
  "Am I at risk of denial in any course?",
  "How many courses do I have left to graduate?",
  "What's my GPA and am I failing any course?",
  "I want to change my grade",
];

const facultyQuestions = [
  // Normal
  "What courses am I teaching this semester?",
  "Show me the students in CS101",
  "Any university news?",
  "How many students are at risk of denial?",
  "Hello",
  // Wow
  "Show me all my courses and their students",
  "Which students have excessive absences across all my courses?",
  "Show me my courses, the news, and at-risk students all at once",
  "How many students are enrolled in CS201 and how many have high absences?",
  "I want to delete a student's grade",
];

async function main() {
  console.log("=== Logging in ===");
  const studentToken = await login("441001");
  const facultyToken = await login("dr.omar");
  console.log("Both tokens OK\n");

  const results = { student: [], faculty: [] };

  console.log("=" .repeat(70));
  console.log("STUDENT QUESTIONS (441001)");
  console.log("=".repeat(70));

  for (let i = 0; i < studentQuestions.length; i++) {
    const q = studentQuestions[i];
    const label = i < 5 ? "Normal" : "WOW";
    console.log(`\n[${i + 1}/${studentQuestions.length}] (${label}) "${q}"`);
    try {
      const r = await ask(studentToken, q);
      const reply = r.reply || r.message || JSON.stringify(r);
      const status = reply.length > 10 ? "OK" : "SHORT";
      const preview = reply.substring(0, 200);
      console.log(`  → ${status} (${reply.length} chars): ${preview}...`);
      results.student.push({ q, status, len: reply.length });
    } catch (e) {
      console.log(`  → ERROR: ${e.message}`);
      results.student.push({ q, status: "ERROR", len: 0 });
    }
    // Rate limit: 2 Gemini calls per question, 5/min limit → wait between questions
    if (i < studentQuestions.length - 1) {
      console.log("  (waiting 25s for rate limit...)");
      await sleep(25000);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("FACULTY QUESTIONS (dr.omar)");
  console.log("=".repeat(70));

  for (let i = 0; i < facultyQuestions.length; i++) {
    const q = facultyQuestions[i];
    const label = i < 5 ? "Normal" : "WOW";
    console.log(`\n[${i + 1}/${facultyQuestions.length}] (${label}) "${q}"`);
    try {
      const r = await ask(facultyToken, q);
      const reply = r.reply || r.message || JSON.stringify(r);
      const status = reply.length > 10 ? "OK" : "SHORT";
      const preview = reply.substring(0, 200);
      console.log(`  → ${status} (${reply.length} chars): ${preview}...`);
      results.faculty.push({ q, status, len: reply.length });
    } catch (e) {
      console.log(`  → ERROR: ${e.message}`);
      results.faculty.push({ q, status: "ERROR", len: 0 });
    }
    if (i < facultyQuestions.length - 1) {
      console.log("  (waiting 25s for rate limit...)");
      await sleep(25000);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  const allResults = [...results.student, ...results.faculty];
  const ok = allResults.filter((r) => r.status === "OK").length;
  const total = allResults.length;
  console.log(`${ok}/${total} questions answered successfully`);

  const failed = allResults.filter((r) => r.status !== "OK");
  if (failed.length > 0) {
    console.log("\nFailed/Short:");
    failed.forEach((r) => console.log(`  - "${r.q}" → ${r.status}`));
  }
}

main().catch(console.error);
