// ==============================================
// SARA — Auth Controller
// Handles login — the ONLY write-like endpoint
// (creates a JWT, does NOT modify academic data)
// ==============================================

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import config from "../config/index.js";

const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token.
 *
 * Body: { username: string, password: string }
 * Returns: { token, user: { id, username, role, nameAr, nameEn } }
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: "اسم المستخدم وكلمة المرور مطلوبان",
        errorEn: "Username and password are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username: String(username) },
    });

    if (!user) {
      return res.status(401).json({
        error: "اسم المستخدم أو كلمة المرور غير صحيحة",
        errorEn: "Invalid username or password",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        error: "اسم المستخدم أو كلمة المرور غير صحيحة",
        errorEn: "Invalid username or password",
      });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    // Return token and user info (never return passwordHash)
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nameAr: user.nameAr,
        nameEn: user.nameEn,
      },
    });
  } catch (err) {
    console.error("[AUTH] Login error:", err.message);
    return res.status(500).json({
      error: "حدث خطأ أثناء تسجيل الدخول",
      errorEn: "Login failed due to server error",
    });
  }
}

/**
 * GET /api/auth/me
 * Returns current authenticated user's info.
 * Requires: authMiddleware
 */
export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        role: true,
        nameAr: true,
        nameEn: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "المستخدم غير موجود",
        errorEn: "User not found",
      });
    }

    return res.json({ user });
  } catch (err) {
    console.error("[AUTH] getMe error:", err.message);
    return res.status(500).json({
      error: "حدث خطأ",
      errorEn: "Server error",
    });
  }
}
