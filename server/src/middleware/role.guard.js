// ==============================================
// SARA — Role Guard Middleware
// Restricts access based on user role
// ==============================================

/**
 * Creates a middleware that allows only specified roles.
 * Must be used AFTER authMiddleware (requires req.user).
 *
 * @param  {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware
 *
 * @example
 * router.get("/grades", roleGuard("student"), getGrades);
 * router.get("/news", roleGuard("student", "faculty"), getNews);
 */
export function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "غير مصرح",
        errorEn: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "ليس لديك صلاحية للوصول إلى هذا المورد",
        errorEn: "Forbidden — insufficient role permissions",
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
}
