// ==============================================
// SARA — Auth Middleware
// Verifies JWT token and attaches user to request
// ==============================================

import jwt from "jsonwebtoken";
import config from "../config/index.js";

/**
 * Extracts and verifies JWT from Authorization header.
 * Attaches decoded user { id, username, role } to req.user.
 * Rejects request if token is missing, expired, or invalid.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "غير مصرح — يرجى تسجيل الدخول",
      errorEn: "Unauthorized — please log in",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً",
        errorEn: "Session expired — please log in again",
      });
    }
    return res.status(401).json({
      error: "توكن غير صالح",
      errorEn: "Invalid token",
    });
  }
}
