// ==============================================
// SARA — Conversation Memory (in-process, per-user)
//
// Keeps a rolling window of the last N turns per user so
// follow-up questions carry context (e.g. "وش اسامي الطلاب"
// after "وش مقرراتي" needs to know we were talking about courses).
//
// Scope: in-memory only. Resets on server restart. Good
// enough for a proof-of-concept; trivial to swap for Redis
// later if needed.
// ==============================================

const MAX_TURNS = 5;
const TTL_MS = 30 * 60 * 1000;

const store = new Map();

export function appendTurn(userId, userMessage, assistantReply) {
  const key = String(userId);
  const now = Date.now();
  const existing = store.get(key);
  const turns = existing?.turns || [];

  turns.push({ user: userMessage, assistant: assistantReply, t: now });
  while (turns.length > MAX_TURNS) turns.shift();

  store.set(key, { turns, updated: now });
}

export function getHistory(userId) {
  const key = String(userId);
  const entry = store.get(key);
  if (!entry) return [];
  if (Date.now() - entry.updated > TTL_MS) {
    store.delete(key);
    return [];
  }
  return entry.turns;
}

export function clearHistory(userId) {
  store.delete(String(userId));
}

export function _debugSize() {
  return store.size;
}
