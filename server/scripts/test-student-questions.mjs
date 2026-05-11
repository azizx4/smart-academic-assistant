const BASE = "http://localhost:3001";

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "441001", password: "student123" }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Login failed: " + JSON.stringify(data));
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
  return await res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const questions = [
  { q: "What are my grades?", label: "Normal" },
  { q: "How many absences do I have?", label: "Normal" },
  { q: "Show me my schedule", label: "Normal" },
  { q: "Any university news?", label: "Normal" },
  { q: "Do I have any alerts?", label: "Normal" },
  { q: "Show me my grades, absences, and schedule all at once", label: "WOW" },
  { q: "Am I at risk of denial in any course?", label: "WOW" },
  { q: "How many courses do I have left to graduate?", label: "WOW" },
  { q: "What's my GPA and am I failing any course?", label: "WOW" },
  { q: "I want to change my grade", label: "WOW" },
];

async function main() {
  const token = await login();
  console.log("Login OK\n");

  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const { q, label } = questions[i];
    console.log(`[${ i + 1}/10] (${label}) "${q}"`);

    try {
      const data = await ask(token, q);
      const reply = data.reply || data.error || JSON.stringify(data);
      const intent = data.intent || "?";
      const tools = data.tools ? data.tools.join(", ") : "-";
      const ok = reply.length > 20 && !reply.includes("error");

      console.log(`  Intent: ${intent}`);
      console.log(`  Tools: ${tools}`);
      console.log(`  Status: ${ok ? "PASS" : "FAIL"} (${reply.length} chars)`);
      console.log(`  Reply:\n${reply.split("\n").map(l => "    " + l).join("\n")}`);
      console.log();

      results.push({ i: i + 1, q, label, intent, ok, len: reply.length });
    } catch (e) {
      console.log(`  ERROR: ${e.message}\n`);
      results.push({ i: i + 1, q, label, intent: "error", ok: false, len: 0 });
    }

    // Wait 25s between questions for Gemini rate limit (5 req/min, 2 calls per question)
    if (i < questions.length - 1) {
      process.stdout.write("  Waiting 25s...");
      await sleep(25000);
      console.log(" done\n");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  for (const r of results) {
    const mark = r.ok ? "PASS" : "FAIL";
    console.log(`  [${mark}] ${r.i}. (${r.label}) "${r.q}" → ${r.intent} (${r.len} chars)`);
  }
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n  ${passed}/10 passed`);
}

main().catch(console.error);
