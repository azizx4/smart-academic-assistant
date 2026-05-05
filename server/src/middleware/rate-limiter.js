// ==============================================
// SARA — Rate Limiter Middleware
// Protects against brute force and abuse
// ==============================================

import rateLimit from "express-rate-limit";
import config from "../config/index.js";

/**
 * General API rate limiter.
 * 100 requests per minute by default.
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "تم تجاوز الحد الأقصى للطلبات — يرجى المحاولة لاحقاً",
    errorEn: "Too many requests — please try again later",
  },
});

/**
 * Strict limiter for authentication endpoints.
 * 5 attempts per minute to prevent brute force.
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "محاولات تسجيل دخول كثيرة — يرجى الانتظار دقيقة",
    errorEn: "Too many login attempts — please wait a minute",
  },
});

/**
 * Chat endpoint limiter.
 * 30 requests per minute.
 */
export const chatLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.chatRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "تم تجاوز حد الرسائل — يرجى الانتظار",
    errorEn: "Chat rate limit exceeded — please wait",
  },
});
