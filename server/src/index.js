// ==============================================
// SARA — Express Server Entry Point
// Smart Academic Read-Only Assistant
// ==============================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import {
  generalLimiter,
  errorHandler,
  authMiddleware,
  readOnlyGuard,
  chatLimiter,
} from "./middleware/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import gradeRoutes from "./routes/grade.routes.js";
import absenceRoutes from "./routes/absence.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import planRoutes from "./routes/plan.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import newsRoutes from "./routes/news.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import auditLogRoutes from "./routes/audit-log.routes.js";


const app = express();

// ------------------------------------------
// Global Middleware
// ------------------------------------------
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(config.apiPrefix, generalLimiter);

// ------------------------------------------
// Routes
// ------------------------------------------

// Public
app.use(config.apiPrefix, healthRoutes);

// Auth (login is public, /me is protected)
app.use(`${config.apiPrefix}/auth`, authRoutes);

// Student data routes (auth + readOnly enforced)
app.use(`${config.apiPrefix}/grades`, authMiddleware, readOnlyGuard, gradeRoutes);
app.use(`${config.apiPrefix}/absences`, authMiddleware, readOnlyGuard, absenceRoutes);
app.use(`${config.apiPrefix}/schedule`, authMiddleware, readOnlyGuard, scheduleRoutes);
app.use(`${config.apiPrefix}/plan`, authMiddleware, readOnlyGuard, planRoutes);
app.use(`${config.apiPrefix}/alerts`, authMiddleware, readOnlyGuard, alertRoutes);

// Shared routes (auth + readOnly enforced)
app.use(`${config.apiPrefix}/news`, authMiddleware, readOnlyGuard, newsRoutes);

// Faculty routes (auth + readOnly enforced)
app.use(`${config.apiPrefix}/faculty`, authMiddleware, readOnlyGuard, facultyRoutes);

// Chat route (auth + rate limit, NOT readOnly because POST is needed for messages)
app.use(`${config.apiPrefix}/chat`, authMiddleware, chatLimiter, chatRoutes);

// Audit log routes (auth + readOnly, faculty only)
app.use(`${config.apiPrefix}/audit-logs`, authMiddleware, readOnlyGuard, auditLogRoutes);

// ------------------------------------------
// Serve React frontend in production
// ------------------------------------------
if (config.nodeEnv === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  // 404 Handler (dev only — in prod, frontend handles all non-API routes)
  app.use((req, res) => {
    res.status(404).json({
      error: "المسار غير موجود",
      errorEn: "Route not found",
      path: req.originalUrl,
    });
  });
}

// ------------------------------------------
// Error Handler (must be last)
// ------------------------------------------
app.use(errorHandler);

// ------------------------------------------
// Start Server
// ------------------------------------------
app.listen(config.port, () => {
  console.log("");
  console.log("===========================================");
  console.log("  SARA - Smart Academic Read-Only Assistant");
  console.log("===========================================");
  console.log(`  Environment : ${config.nodeEnv}`);
  console.log(`  Port        : ${config.port}`);
  console.log(`  API Prefix  : ${config.apiPrefix}`);
  console.log(`  AI Provider : ${config.aiProvider}`);
  console.log(`  CORS Origin : ${config.corsOrigin}`);
  console.log("-------------------------------------------");
  console.log("  Routes:");
  console.log("    POST /api/auth/login");
  console.log("    GET  /api/auth/me");
  console.log("    GET  /api/grades");
  console.log("    GET  /api/absences");
  console.log("    GET  /api/schedule");
  console.log("    GET  /api/plan");
  console.log("    GET  /api/alerts");
  console.log("    GET  /api/news");
  console.log("    GET  /api/faculty/courses");
  console.log("    GET  /api/faculty/courses/:code/students");
  console.log("    GET  /api/faculty/absences/excessive");
  console.log("    POST /api/chat");
  console.log("    GET  /api/audit-logs");
  console.log("    GET  /api/audit-logs/stats");
  console.log("===========================================");
  console.log("");
});

export default app;
