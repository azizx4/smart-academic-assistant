// ==============================================
// SARA — Error Handler Middleware
// Central error handling for all routes
// ==============================================

/**
 * Global error handler. Must be registered LAST in Express middleware chain.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Prisma known errors
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "السجل غير موجود",
      errorEn: "Record not found",
    });
  }

  // JWT errors (shouldn't reach here normally, but just in case)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "توكن غير صالح",
      errorEn: "Invalid token",
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: "حدث خطأ في الخادم",
    errorEn: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
}
