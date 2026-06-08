import fs from "node:fs";
import path from "node:path";

loadEnvFile();

export const config = {
  port: numberFromEnv("PORT", 3000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",
  verifyToken: requiredEnv("META_VERIFY_TOKEN"),
  pageAccessToken: requiredEnv("META_PAGE_ACCESS_TOKEN"),
  appSecret: process.env.META_APP_SECRET || "",
  graphVersion: process.env.META_GRAPH_VERSION || "v25.0",
  event: {
    name: process.env.EVENT_NAME || "Su kien dac biet",
    date: process.env.EVENT_DATE || "20/06/2026",
    time: process.env.EVENT_TIME || "18:30",
    location: process.env.EVENT_LOCATION || "Dia diem su kien",
    host: process.env.EVENT_HOST || "Ban to chuc"
  }
};

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}
