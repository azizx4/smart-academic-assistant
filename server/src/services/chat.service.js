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
  const english = /\b(update|modify|delete|edit|drop\s+course|unenroll|enroll|remove|change\s+my|register|add\s+course|withdraw|swap\s+course|switch\s+section|cancel|sign\s+(me\s+)?up|submit|upload|post|create|insert|put|write|save|store)\b/i;
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
  const intent = detectIntent(message, user.role);

  if (intent === "overall_status") {
    return await handleOverallStatus(user, userName);
  }
  if (intent === "unknown") {
    return { reply: fallbackUnknown(userName), intent: "unknown" };
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

// ==============================================
// Alert translation helpers (seed generates Arabic-only alerts)
// ==============================================
function translateAlertTitle(title) {
  const map = {
    "تنبيه غياب": "Absence Warning",
    "إنذار غياب - خطر الحرمان": "Absence Alert — Denial Risk",
    "تنبيه درجات": "Grade Warning",
    "موعد الاختبارات النهائية": "Final Exams Schedule",
  };
  return map[title] || title;
}

function translateAlertBody(body) {
  return body
    .replace(/لديك (\d+) غيابات في مقرر (.+?)\. الحد الأقصى المسموح (\d+) غيابات\./,
      (_, count, course, max) => `You have ${count} absences in ${course}. Maximum allowed: ${max}.`)
    .replace(/تجاوزت الحد المسموح للغياب في مقرر (.+?)\. عدد الغيابات: (\d+)\. يرجى مراجعة شؤون الطلاب\./,
      (_, course, count) => `You exceeded the absence limit in ${course}. Absences: ${count}. Please contact Student Affairs.`)
    .replace(/درجتك في مقرر (.+?) أقل من الحد الأدنى للنجاح \((\d+)\/100\)\./,
      (_, course, score) => `Your grade in ${course} is below passing (${score}/100).`)
    .replace(/تبدأ الاختبارات النهائية يوم (.+?)\. يرجى مراجعة الجدول على البوابة الأكاديمية\./,
      (_, date) => `Final exams start on ${date}. Please check the schedule on the academic portal.`);
}

function formatFallback(intent, data, name) {
  switch (intent) {
    case "grades": {
      if (!data?.grades?.length) return `${name}, no grades found.`;
      let t = `Your grades, ${name}:\n\n`;
      for (const g of data.grades) {
        t += `• ${g.courseNameEn || g.courseCode} (${g.courseCode}): ${g.total}/100 — ${g.letterGrade}\n`;
      }
      t += `\nGPA: ${data.gpa.gpa} / 4.0`;
      return t;
    }
    case "absences": {
      if (!data?.length) return `${name}, you have no absences.`;
      let t = `Your absences, ${name}:\n\n`;
      for (const c of data) {
        t += `• ${c.courseNameEn || c.courseCode} (${c.courseCode}): ${c.totalAbsences} absence(s)\n`;
      }
      return t;
    }
    case "schedule":
    case "student_courses": {
      if (!data?.length) return `${name}, no schedule found.`;
      let t = `Your schedule, ${name}:\n\n`;
      let day = "";
      for (const s of data) {
        if (s.dayOfWeek !== day) { day = s.dayOfWeek; t += `\n${day}:\n`; }
        t += `  ${s.startTime}-${s.endTime} | ${s.courseNameEn || s.courseCode} | ${s.room}\n`;
      }
      return t;
    }
    case "plan": {
      if (!data) return `${name}, no plan found.`;
      return `Your plan, ${name}:\nCompleted: ${data.summary.completed}\nIn progress: ${data.summary.inProgress}\nRemaining: ${data.summary.remaining}`;
    }
    case "alerts": {
      if (!data?.alerts?.length) return `${name}, no alerts.`;
      let t = `Your alerts (${data.unreadCount} unread):\n\n`;
      for (const a of data.alerts) {
        const icon = a.type === "urgent" ? "🚨" : a.type === "warning" ? "⚠️" : "ℹ️";
        const title = translateAlertTitle(a.title);
        const body = translateAlertBody(a.body);
        t += `${icon} ${title}\n   ${body}\n\n`;
      }
      return t;
    }
    case "news": {
      if (!data?.length) return "No news available.";
      let t = "Latest news:\n\n";
      for (const n of data) t += `📰 ${n.titleEn || n.titleAr}\n\n`;
      return t;
    }
    case "faculty_courses": {
      if (!data?.length) return `${name}, no courses found.`;
      let t = `Your courses, ${name}:\n\n`;
      for (const c of data) {
        t += `• ${c.nameEn || c.code} (${c.code}) — ${c.enrolledStudents} students\n`;
      }
      return t;
    }
    case "faculty_absences": {
      if (!data?.length) return `${name}, no students exceeded the limit.`;
      let t = `Students exceeding absence limit, ${name}:\n\n`;
      for (const s of data) {
        t += `⚠️ ${s.student.nameEn || s.student.nameAr} — ${s.course.nameEn || s.course.code} (${s.course.code}): ${s.absenceCount} absences\n`;
      }
      t += `\nTotal: ${data.length} student(s)`;
      return t;
    }
    default: return `Sorry, type "help" for available services.`;
  }
}
