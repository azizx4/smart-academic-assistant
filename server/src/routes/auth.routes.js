// ==============================================
// SARA — Auth Routes
// POST /api/auth/login — public
// GET  /api/auth/me    — protected
// ==============================================

import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller.js";
import { authMiddleware, authLimiter } from "../middleware/index.js";

const router = Router();

// Public: login with username + password
router.post("/login", authLimiter, login);

// Protected: get current user info
router.get("/me", authMiddleware, getMe);

export default router;
