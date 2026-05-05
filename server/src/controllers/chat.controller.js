// ==============================================
// SARA — Chat Controller
// POST /api/chat — main conversation endpoint
// ==============================================

import { processChat } from "../services/chat.service.js";

/**
 * POST /api/chat
 * Body: { message: string }
 * Returns: { reply: string, intent: string }
 */
export async function handleChat(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        error: "الرسالة مطلوبة",
        errorEn: "Message is required",
      });
    }

    // Limit message length
    if (message.length > 500) {
      return res.status(400).json({
        error: "الرسالة طويلة جداً — الحد الأقصى 500 حرف",
        errorEn: "Message too long — max 500 characters",
      });
    }

    const result = await processChat(message.trim(), req.user);

    return res.json({
      reply: result.reply,
      intent: result.intent,
      ...(result.fallback && { fallback: true }),
    });
  } catch (err) {
    console.error("[CHAT] Error:", err.message);
    next(err);
  }
}
