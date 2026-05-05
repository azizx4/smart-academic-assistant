// ==============================================
// SARA — Middleware Tests
// Tests for Auth, RoleGuard, ReadOnlyGuard
// ==============================================

import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../src/middleware/auth.middleware.js";
import { roleGuard } from "../src/middleware/role.guard.js";
import { readOnlyGuard } from "../src/middleware/readonly.guard.js";

// Mock config
vi.mock("../src/config/index.js", () => ({
  default: { jwtSecret: "test-secret-for-testing-only-32chars!" },
}));

// Helper to create mock req/res/next
function createMocks(overrides = {}) {
  const req = {
    headers: {},
    method: "GET",
    originalUrl: "/api/test",
    user: null,
    ...overrides,
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

// ------------------------------------------
// Auth Middleware Tests
// ------------------------------------------
describe("authMiddleware", () => {
  const secret = "test-secret-for-testing-only-32chars!";

  it("should reject request without Authorization header", () => {
    const { req, res, next } = createMocks();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject request with invalid token", () => {
    const { req, res, next } = createMocks({
      headers: { authorization: "Bearer invalid-token" },
    });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject expired token", () => {
    const token = jwt.sign(
      { id: 1, username: "test", role: "student" },
      secret,
      { expiresIn: "0s" }
    );
    const { req, res, next } = createMocks({
      headers: { authorization: `Bearer ${token}` },
    });
    // Small delay to ensure expiration
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should pass valid token and attach user to req", () => {
    const payload = { id: 1, username: "441001", role: "student" };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const { req, res, next } = createMocks({
      headers: { authorization: `Bearer ${token}` },
    });
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining(payload));
  });

  it("should reject Bearer with empty token", () => {
    const { req, res, next } = createMocks({
      headers: { authorization: "Bearer " },
    });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ------------------------------------------
// Role Guard Tests
// ------------------------------------------
describe("roleGuard", () => {
  it("should allow user with matching role", () => {
    const { req, res, next } = createMocks();
    req.user = { id: 1, role: "student" };
    roleGuard("student")(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should allow user with one of multiple roles", () => {
    const { req, res, next } = createMocks();
    req.user = { id: 1, role: "faculty" };
    roleGuard("student", "faculty")(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should reject user with wrong role", () => {
    const { req, res, next } = createMocks();
    req.user = { id: 1, role: "student" };
    roleGuard("faculty")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject when no user on request", () => {
    const { req, res, next } = createMocks();
    roleGuard("student")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ------------------------------------------
// ReadOnly Guard Tests
// ------------------------------------------
describe("readOnlyGuard", () => {
  it("should allow GET requests", () => {
    const { req, res, next } = createMocks({ method: "GET" });
    readOnlyGuard(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should allow HEAD requests", () => {
    const { req, res, next } = createMocks({ method: "HEAD" });
    readOnlyGuard(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should allow OPTIONS requests", () => {
    const { req, res, next } = createMocks({ method: "OPTIONS" });
    readOnlyGuard(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should block POST requests", () => {
    const { req, res, next } = createMocks({ method: "POST" });
    readOnlyGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(next).not.toHaveBeenCalled();
  });

  it("should block PUT requests", () => {
    const { req, res, next } = createMocks({ method: "PUT" });
    readOnlyGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("should block DELETE requests", () => {
    const { req, res, next } = createMocks({ method: "DELETE" });
    readOnlyGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("should block PATCH requests", () => {
    const { req, res, next } = createMocks({ method: "PATCH" });
    readOnlyGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
