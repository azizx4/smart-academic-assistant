// ==============================================
// SARA — Focused Live Test
// Stays within Gemini free-tier rate limit (5 req/min).
// Each chat turn = 2 Gemini calls, so we run at most 2
// real-AI queries per minute, with mandatory pauses.
// ==============================================

const BASE = process.env.SARA_URL || "http://localhost:3001/api";

async function login(u, p) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p }),
  });
  if (!r.ok) throw new Error(`login failed: ${r.status}`);
  return (await r.json()).token;
}

async function chat(token, message) {
  const r = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

function pretty(tag, q, { status, data }) {
  console.log("\n" + "─".repeat(70));
  console.log(`▸ ${tag}   "${q}"`);
  console.log(`  status=${status}  intent=${data.intent}${data.tools ? "  tools=" + data.tools.join("+") : ""}${data.fallback ? "  [FALLBACK]" : ""}`);
  const reply = (data.reply || data.error || "").replace(/\s+/g, " ").slice(0, 260);
  console.log(`  reply : ${reply}`);
}

const NO_AI = [
  { tag: "greeting (canned)",        q: "السلام عليكم" },
  { tag: "write attempt (canned)",    q: "احذف مادة البرمجة" },
  { tag: "GPA false-positive fix",    q: "كم معدلي" },
  { tag: "unavailable (canned)",      q: "كم رسومي" },
];

const AI = [
  { tag: "grades (Saudi dialect)",    q: "ابي اشوف علاماتي" },
  { tag: "multi-tool (overall)",      q: "وش وضعي بشكل عام" },
];

(async () => {
  const token = await login("441001", "student123");
  console.log("✓ logged in as 441001 (student)");

  console.log("\n═══ Phase 1: Canned responses (no Gemini call) ═══");
  for (const c of NO_AI) pretty(c.tag, c.q, await chat(token, c.q));

  console.log("\n═══ Phase 2: Real Gemini tool calls (slow — rate limit) ═══");
  console.log("waiting 45s for quota to clear…");
  await new Promise((r) => setTimeout(r, 45_000));

  pretty(AI[0].tag, AI[0].q, await chat(token, AI[0].q));

  console.log("\nwaiting 50s before next AI call…");
  await new Promise((r) => setTimeout(r, 50_000));

  pretty(AI[1].tag, AI[1].q, await chat(token, AI[1].q));

  console.log("\n" + "═".repeat(70) + "\nDONE");
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
