// ==============================================
// SARA — API Service
// All communication with the backend
// ==============================================

const API_BASE = "/api";

/**
 * Get stored auth token from memory.
 */
let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

export function clearToken() {
  authToken = null;
}

/**
 * Make an authenticated API request.
 */
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || data.errorEn || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ------------------------------------------
// Auth
// ------------------------------------------
export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export async function getMe() {
  return request("/auth/me");
}

// ------------------------------------------
// Chat
// ------------------------------------------
export async function sendMessage(message) {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
