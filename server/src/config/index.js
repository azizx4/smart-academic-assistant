import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load .env from server/ directory first, then root
dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config({ path: resolve(__dirname, "../../../.env") });
const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  apiPrefix: process.env.API_PREFIX || "/api",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  aiProvider: process.env.AI_PROVIDER || "gemini",
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2",
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "5", 10),
  chatRateLimitMax: parseInt(process.env.CHAT_RATE_LIMIT_MAX || "30", 10),
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173"),
};
const requiredVars = ["jwtSecret"];
for (const key of requiredVars) {
  if (!config[key] || config[key] === "CHANGE_ME_TO_A_RANDOM_SECRET_AT_LEAST_32_CHARS") {
    console.error("[CONFIG ERROR] " + key + " is not set.");
    process.exit(1);
  }
}
export default config;