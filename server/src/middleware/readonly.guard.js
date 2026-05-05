// ==============================================
// SARA — ReadOnly Guard Middleware
// Defense-in-depth: rejects non-GET on data routes
// ==============================================

/**
 * Blocks any HTTP method that could modify data.
 * Only GET and HEAD are allowed through.
 *
 * This is a defense-in-depth measure — even if a developer
 * accidentally creates a POST/PUT/DELETE route on data endpoints,
 * this middleware will reject it.
 *
 * Applied to: /api/grades, /api/absences, /api/schedule,
 *             /api/plan, /api/alerts, /api/news, /api/faculty
 *
 * NOT applied to: /api/auth (needs POST for login),
 *                 /api/chat (needs POST for messages)
 */
export function readOnlyGuard(req, res, next) {
  const allowedMethods = ["GET", "HEAD", "OPTIONS"];

  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: "هذا النظام للقراءة فقط — لا يمكن تعديل البيانات",
      errorEn: "This system is read-only — data modification is not allowed",
      method: req.method,
      path: req.originalUrl,
    });
  }

  next();
}
