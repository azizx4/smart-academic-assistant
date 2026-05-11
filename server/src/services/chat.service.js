// ==============================================
// SARA — Chat Service (Tool-Calling Orchestrator)
//
// Flow:
//   1. Lightweight pre-filter for greetings / help / write attempts
//      / unavailable features (these don't need the AI).
//   2. If provider supports tool calling:
//        a. Ask the model to select one or more tools.
//        b. Execute each tool through the safe ToolExecutor
//           (role + schema validation).
//        c. Ask the model to turn the results into a natural reply.
//   3. On any AI failure, fall back to the legacy keyword-based path.
//
// SECURITY: The model's tool selection is advisory only. The
// ToolExecutor re-validates the role for every call and rejects
// anything not registered.
// ==============================================

import { PrismaClient } from "@prisma/client";
import { getAIProvider } from "../providers/factory.js";
import {
  SYSTEM_PROMPT,
  TOOL_SYSTEM_PROMPT,
  INTENT_PATTERNS,
} from "../providers/system-prompt.js";
import { initializeTools, registry } from "../tools/index.js";
import { executeTool, ToolError } from "../tools/tool-executor.js";
import { appendTurn, getHistory } from "./conversation-memory.js";
import { logChatInteraction } from "./audit-log.service.js";
import { getStudentGrades, getStudentGPA } from "./grade.service.js";
import { getStudentAbsences, getExcessiveAbsences } from "./absence.service.js";
import { getStudentSchedule } from "./schedule.service.js";
import { getStudentPlan } from "./plan.service.js";
import { getStudentAlerts } from "./alert.service.js";
import { getNews } from "./news.service.js";
import { getFacultyCourses } from "./faculty.service.js";
import { translateAlertTitle, translateAlertBody } from "./alert-translation.js";

const prisma = new PrismaClient();

initializeTools();

export async function processChat(message, user) {
  const startTime = Date.now();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { nameEn: true, nameAr: true },
  });
  const userName = fullUser?.nameEn || fullUser?.nameAr || user.username;

  const canned = cannedResponse(message, user, userName);
  if (canned) {
    appendTurn(user.id, message, canned.reply);
    // Audit: log canned responses (including blocked write attempts)
    logChatInteraction({
      userId: user.id,
      username: user.username,
      userRole: user.role,
      message,
      response: canned.reply,
      intent: canned.intent,
      blocked: canned.intent === "write_rejected",
      blockReason: canned.intent === "write_rejected" ? "write_attempt" : null,
      provider: "canned",
      responseMs: Date.now() - startTime,
    });
    return canned;
  }

  const provider = getAIProvider();
  let result;
  let providerName = provider.name || "unknown";

  if (provider.supportsTools()) {
    try {
      result = await runToolCallingFlow(message, user, userName, provider);
      providerName = provider.name + "/tools";
    } catch (err) {
      console.error("[CHAT] Tool-calling flow failed:", err.message);
      result = await runLegacyFlow(message, user, userName, provider);
      providerName = provider.name + "/legacy";
    }
  } else {
    result = await runLegacyFlow(message, user, userName, provider);
    providerName = provider.name + "/legacy";
  }

  appendTurn(user.id, message, result.reply);

  // Audit: log AI-handled interactions
  logChatInteraction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    message,
    response: result.reply,
    intent: result.intent,
    toolCalled: result.tools?.join(",") || null,
    blocked: false,
    provider: providerName,
    responseMs: Date.now() - startTime,
  });

  return result;
}

// ==============================================
// Tool-calling flow (preferred path)
// ==============================================
async function runToolCallingFlow(message, user, userName, provider) {
  const toolSchemas = registry.toGeminiSchema(user.role);
  const history = getHistory(user.id);
  const context = { role: user.role, userName, history };

  const selection = await provider.selectTool(
    message,
    toolSchemas,
    context,
    TOOL_SYSTEM_PROMPT
  );

  if (selection.type === "text") {
    // If Gemini returned no tool call but legacy keywords match a known
    // intent, use the legacy flow to get real data instead of returning
    // an empty/generic AI response.
    const legacyIntent = detectIntent(message, user.role);
    if (legacyIntent !== "unknown") {
      return await runLegacyFlow(message, user, userName, provider);
    }
    if (selection.text && selection.text.trim().length > 10) {
      return { reply: selection.text, intent: "conversation" };
    }
    return {
      reply: selection.text || fallbackUnknown(userName),
      intent: "conversation",
    };
  }

  const toolCalls = selection.calls;
  const toolResults = [];
  const executedNames = [];

  for (const call of toolCalls) {
    try {
      const result = await executeTool(call.name, call.args, user);
      toolResults.push(result);
      executedNames.push(call.name);
    } catch (err) {
      if (err instanceof ToolError) {
        console.warn(`[CHAT] Tool ${call.name} rejected: ${err.code}`);
        toolResults.push({ error: err.code, message: err.message });
        executedNames.push(call.name + ":" + err.code);
      } else {
        throw err;
      }
    }
  }

  const reply = await provider.respondWithToolResults(
    message,
    toolCalls,
    toolResults,
    { role: user.role, userName, history },
    TOOL_SYSTEM_PROMPT
  );

  return {
    reply,
    intent: executedNames.join(",") || "conversation",
    tools: executedNames,
  };
}

// ==============================================
// Pre-filter: greetings, help, writes, unavailable features.
// These short-circuit before any AI call.
// ==============================================
function cannedResponse(message, user, userName) {
  if (isGreeting(message)) {
    const g = user.role === "student"
      ? `Hi ${userName}! How can I help? Ask me about your grades, absences, schedule, or anything academic.`
      : `Hi ${userName}! Ask me about your courses, students, or absence reports.`;
    return { reply: g, intent: "greeting" };
  }
  if (isHelp(message)) {
    const h = user.role === "student"
      ? `Hi ${userName}! I can help with:\n\n• Grades & GPA\n• Absences\n• Schedule\n• Enrolled courses\n• Academic plan\n• Alerts\n• News\n\nTry asking me!`
      : `Hi ${userName}! I can help with:\n\n• Your courses\n• Excessive absences\n• News`;
    return { reply: h, intent: "help" };
  }
  if (isWriteAttempt(message)) {
    return {
      reply: "Sorry, SARA operates in read-only mode. Please contact Student Affairs.",
      intent: "write_rejected",
    };
  }
  if (isUnavailableFeature(message)) {
    return {
      reply: "This service is not currently available in SARA. I can help with: grades, absences, schedule, plan, alerts, and news.",
      intent: "unavailable",
    };
  }
  return null;
}

function isGreeting(msg) {
  return /^\s*(مرحبا|السلام|هلا|يا ?هلا|أهلا|اهلا|صباح الخير|مساء الخير|كيف حالك|كيفك|شخبارك|هاي|السلام عليكم|وعليكم السلام|يا سلام|أهلين|هلو|hi|hello|hey|good morning|good evening|good afternoon|howdy|greetings|what'?s up|whats up|sup|yo|hiya)/i.test(msg);
}
function isHelp(msg) {
  if (/^\s*\?+\s*$/.test(msg)) return true;
  return /(مساعد[ةه]?|وش تقدر تسوي|ايش تقدر|كيف استخدم|وش خدماتك|ساعدني|وش تعرف تسوي|شلون أستخدمك|ايش تسوي|وش فيك|عطني قائم[ةه]|\bhelp\b|what can you do|how do i use|how to use|what are your features|what do you offer|\bcommands\b|\boptions\b|\bmenu\b|guide me)/i.test(msg);
}
function isWriteAttempt(msg) {
  // Strict: Arabic write commands must be standalone (surrounded by
  // spaces, punctuation, or message boundaries) — avoids false
  // positives like "معدلي" (GPA) matching the root "عدل" (modify).
  const arabicStandalone = /(^|[\s،.؟!])(احذف|امسح|اضف|أضف|اضيف|ارفع|ادخل|سجل|الغي|ألغي|عدّل|غيّر|حذف|تعديل|أبي أسجل|ابي اسجل|سجلني|ضيف|بدّل|حوّل|شيل|نزّل|ارسل|ابي ادخل|ابي أضيف)([\s،.؟!]|$)/i;
  const english = /\b(update|modify|delete|edit|drop\s+course|unenroll|enroll|remove|change\s+(my|a|the|student)|register|add\s+course|withdraw|swap\s+course|switch\s+section|cancel|sign\s+(me\s+)?up|submit|upload|post|create|insert|put|write|save|store)\b/i;
  return arabicStandalone.test(msg) || english.test(msg);
}
function isUnavailableFeature(msg) {
  return [
    /رسوم/i, /مالي/i, /دفع/i, /فاتور/i, /مكافأ/i, /تحويل/i,
    /سكن/i, /خطاب/i, /وثيق/i, /شهاد/i, /تعريف/i, /وظائف/i,
    /مواقف/i, /مكتبة/i, /غرام/i, /قرض/i, /بطاقة جامع/i, /تأشير/i, /موقف سيار/i,
    /fee/i, /payment/i, /transfer/i, /housing/i, /certificate/i,
    /tuition/i, /\bbill\b/i, /invoice/i, /financial aid/i, /scholarship/i,
    /dormitory/i, /\bdorm\b/i, /\bletter\b/i, /\bdocument\b/i, /transcript request/i,
    /\bjob\b/i, /career/i, /parking/i, /library fine/i, /\bloan\b/i,
  ].some((p) => p.test(msg));
}

function fallbackUnknown(name) {
  return `${name}, I didn't understand your question. Type "help" for available services.`;
}

// ==============================================
// Legacy keyword flow — defensive fallback when the AI
// layer or function-calling is unavailable.
// ==============================================
async function runLegacyFlow(message, user, userName, provider) {
  const allIntents = detectAllIntents(message, user.role);
  const intent = allIntents[0] || "unknown";

  if (intent === "overall_status") {
    return await handleOverallStatus(user, userName);
  }
  if (intent === "unknown") {
    return { reply: fallbackUnknown(userName), intent: "unknown" };
  }

  // Multi-intent: if user asked for multiple things, gather all data
  if (allIntents.length > 1) {
    const allData = {};
    for (const i of allIntents) {
      allData[i] = await fetchDataForIntent(i, user);
    }
    const context = {
      role: user.role, userName, dataType: allIntents.join("+"), data: allData, lang: "en",
    };
    try {
      const reply = await provider.generateResponse(message, context, SYSTEM_PROMPT);
      return { reply, intent: allIntents.join(",") };
    } catch (err) {
      console.error("[CHAT] Legacy multi-intent AI error:", err.message);
      // Fallback: format each intent separately
      const parts = allIntents.map((i) => formatFallback(i, allData[i], userName));
      return { reply: parts.join("\n\n---\n\n"), intent: allIntents.join(","), fallback: true };
    }
  }

  const data = await fetchDataForIntent(intent, user);
  const context = { role: user.role, userName, dataType: intent, data, lang: "en" };

  try {
    const reply = await provider.generateResponse(message, context, SYSTEM_PROMPT);
    return { reply, intent };
  } catch (err) {
    console.error("[CHAT] Legacy AI error:", err.message);
    return { reply: formatFallback(intent, data, userName), intent, fallback: true };
  }
}

async function handleOverallStatus(user, userName) {
  try {
    if (user.role === "student") {
      const grades = await getStudentGrades(user.id);
      const gpa = await getStudentGPA(user.id);
      const absences = await getStudentAbsences(user.id);
      const alerts = await getStudentAlerts(user.id);
      const totalAbs = absences.reduce((s, c) => s + c.totalAbsences, 0);
      let s = `Here's your summary, ${userName}:\n\n`;
      s += `GPA: ${gpa.gpa} / 4.0\n`;
      s += `Courses: ${grades.length}\n`;
      s += `Total absences: ${totalAbs}\n`;
      s += `Unread alerts: ${alerts.unreadCount}`;
      return { reply: s, intent: "overall_status" };
    }
    const courses = await getFacultyCourses(user.id);
    const excessive = await getExcessiveAbsences(user.id);
    let s = `Here's your summary, ${userName}:\n\n`;
    s += `Courses: ${courses.length}\n`;
    s += `Students exceeding limit: ${excessive.length}`;
    return { reply: s, intent: "overall_status" };
  } catch {
    return {
      reply: "Sorry, please try again.",
      intent: "overall_status", fallback: true,
    };
  }
}

function detectIntent(message, role) {
  for (const p of INTENT_PATTERNS) {
    if (p.roleRequired && p.roleRequired !== role) continue;
    for (const r of p.patterns) if (r.test(message)) return p.intent;
  }
  return "unknown";
}

function detectAllIntents(message, role) {
  const found = [];
  for (const p of INTENT_PATTERNS) {
    if (p.roleRequired && p.roleRequired !== role) continue;
    for (const r of p.patterns) {
      if (r.test(message)) {
        if (!found.includes(p.intent)) found.push(p.intent);
        break;
      }
    }
  }
  return found;
}

async function fetchDataForIntent(intent, user) {
  switch (intent) {
    case "grades": {
      const g = await getStudentGrades(user.id);
      const gpa = await getStudentGPA(user.id);
      return { grades: g, gpa };
    }
    case "absences": return await getStudentAbsences(user.id);
    case "schedule":
    case "student_courses": return await getStudentSchedule(user.id);
    case "plan": return await getStudentPlan(user.id);
    case "alerts": return await getStudentAlerts(user.id);
    case "news": return await getNews();
    case "faculty_courses": return await getFacultyCourses(user.id);
    case "faculty_absences": return await getExcessiveAbsences(user.id);
    default: return null;
  }
}

// Alert translation helpers are in ./alert-translation.js
// (separated to avoid circular dependency with tools/alerts.tool.js)

function formatFallback(intent, data, name) {
  switch (intent) {
    case "grades": {
      if (!data?.grades?.length) return `${name}, no grades found.`;
      let t = `**Your Grades, ${name}:**\n\n`;
      t += `| Course | Total | Grade |\n`;
      t += `| :--- | :---: | :---: |\n`;
      const failing = [];
      for (const g of data.grades) {
        const cn = `${g.courseNameEn || g.courseCode} (${g.courseCode})`;
        if (g.letterGrade === "F") failing.push(g.courseNameEn || g.courseCode);
        t += `| ${cn} | ${g.total} | ${g.letterGrade} |\n`;
      }
      t += `\n**GPA:** ${data.gpa.gpa} / 4.0 (${data.gpa.totalCredits} credits)`;
      if (failing.length > 0) t += `\n\n⚠️ Failing: ${failing.join(", ")}`;
      return t;
    }
    case "absences": {
      if (!data?.length) return `${name}, you have no absences!`;
      const LIMIT = 5;
      let t = `**Your Absences, ${name}:**\n\n`;
      t += `| Course | Count | Dates | Status |\n`;
      t += `| :--- | :---: | :--- | :--- |\n`;
      for (const c of data) {
        const cn = `${c.courseNameEn || c.courseCode} (${c.courseCode})`;
        const abs = c.totalAbsences;
        const status = abs >= LIMIT ? "⛔ Denied" : abs >= LIMIT - 1 ? "⚠️ Risk" : "✅ OK";
        const dates = (c.records || []).map(r => r.date.replace(/^\d{4}-/, "")).join(", ");
        t += `| ${cn} | ${abs} | ${dates} | ${status} |\n`;
      }
      t += `\nLimit: ${LIMIT} absences per course.`;
      return t;
    }
    case "schedule":
    case "student_courses": {
      if (!data?.length) return `${name}, no schedule found.`;
      let t = `**Your Schedule, ${name}:**\n\n`;
      t += `| Day | Time | Course | Room |\n`;
      t += `| :--- | :--- | :--- | :--- |\n`;
      for (const s of data) {
        t += `| ${s.dayOfWeek} | ${s.startTime}-${s.endTime} | ${s.courseNameEn || s.courseCode} | ${s.room} |\n`;
      }
      return t;
    }
    case "plan": {
      if (!data) return `${name}, no plan found.`;
      const { completed, inProgress, remaining } = data.summary;
      const total = completed + inProgress + remaining;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      let t = `**Academic Plan, ${name}:**\n\n`;
      t += `| Status | Count |\n| :--- | :---: |\n`;
      t += `| ✅ Completed | ${completed} |\n| 📚 In Progress | ${inProgress} |\n| 📋 Remaining | ${remaining} |\n`;
      t += `\n**Progress:** ${pct}% (${completed}/${total})`;
      if (data.inProgress?.length) {
        t += `\n\n**In Progress:**\n\n| Course | Code | Semester |\n| :--- | :--- | :--- |\n`;
        for (const c of data.inProgress) t += `| ${c.courseNameEn || c.courseNameAr} | ${c.courseCode} | ${c.semester} |\n`;
      }
      return t;
    }
    case "alerts": {
      if (!data?.alerts?.length) return `${name}, no alerts.`;
      let t = `**Your Alerts** (${data.unreadCount} unread):\n\n`;
      t += `| Alert | Details |\n| :--- | :--- |\n`;
      for (const a of data.alerts) {
        const icon = a.type === "urgent" ? "🚨" : a.type === "warning" ? "⚠️" : "ℹ️";
        t += `| ${icon} ${a.titleEn || translateAlertTitle(a.title)} | ${a.bodyEn || translateAlertBody(a.body)} |\n`;
      }
      return t;
    }
    case "news": {
      if (!data?.length) return "No news available.";
      let t = `**Latest News:**\n\n`;
      t += `| Title | Category |\n| :--- | :--- |\n`;
      for (const n of data) t += `| ${n.titleEn || n.titleAr} | ${n.category} |\n`;
      return t;
    }
    case "faculty_courses": {
      if (!data?.length) return `${name}, no courses found.`;
      let t = `**Your Courses, ${name}:**\n\n`;
      t += `| Course | Code | Students |\n| :--- | :--- | :---: |\n`;
      for (const c of data) t += `| ${c.nameEn || c.code} | ${c.code} | ${c.enrolledStudents} |\n`;
      return t;
    }
    case "faculty_absences": {
      if (!data?.length) return `${name}, no students exceeded the limit.`;
      let t = `**Students Exceeding Absence Limit:**\n\n`;
      t += `| Student | Course | Absences |\n| :--- | :--- | :---: |\n`;
      for (const s of data) t += `| ${s.student.nameEn || s.student.nameAr} | ${s.course.nameEn || s.course.code} (${s.course.code}) | ${s.absenceCount} |\n`;
      t += `\n**Total:** ${data.length} student(s)`;
      return t;
    }
    default: return `Sorry, type "help" for available services.`;
  }
}
