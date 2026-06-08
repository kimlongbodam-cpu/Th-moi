import crypto from "node:crypto";
import http from "node:http";
import { URL } from "node:url";

import { config } from "./config.js";
import { getMessengerProfile } from "./meta.js";
import { getProfile, listProfiles, saveProfile } from "./profile-store.js";
import { renderInvite } from "./invite-template.js";

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === "GET" && url.pathname === "/webhook") {
      return handleWebhookVerification(url, response);
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      return handleWebhookEvent(request, response);
    }

    if (request.method === "GET" && url.pathname === "/profiles") {
      const profiles = await listProfiles();
      return sendJson(response, 200, { profiles });
    }

    const inviteMatch = url.pathname.match(/^\/invite\/([^/]+)$/);
    if (request.method === "GET" && inviteMatch) {
      return handleInvite(inviteMatch[1], url, response);
    }

    return sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { error: "Internal server error" });
  }
});

server.listen(config.port, () => {
  console.log(`Messenger invite server listening on http://localhost:${config.port}`);
});

function handleWebhookVerification(url, response) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === config.verifyToken && challenge) {
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(challenge);
    return;
  }

  sendJson(response, 403, { error: "Webhook verification failed" });
}

async function handleWebhookEvent(request, response) {
  const rawBody = await readRequestBody(request);
  if (!isValidSignature(request, rawBody)) {
    return sendJson(response, 401, { error: "Invalid webhook signature" });
  }

  const payload = JSON.parse(rawBody || "{}");
  if (payload.object !== "page") {
    return sendJson(response, 400, { error: "Unsupported webhook object" });
  }

  const processed = [];
  for (const entry of payload.entry || []) {
    for (const event of entry.messaging || []) {
      const psid = event.sender?.id;
      if (!psid || !event.message) continue;

      try {
        const profile = await getMessengerProfile(psid);
        const saved = await saveProfile(profile);
        const inviteUrl = buildPublicUrl(`/invite/${encodeURIComponent(psid)}`);
        processed.push({ psid, name: displayName(saved), inviteUrl });
        console.log(`Created invite for ${displayName(saved)}: ${inviteUrl}`);
      } catch (error) {
        console.error(error.message);
        processed.push({ psid, error: error.message });
      }
    }
  }

  sendJson(response, 200, { ok: true, processed });
}

async function handleInvite(psid, url, response) {
  const profile = await getProfile(decodeURIComponent(psid));
  if (!profile) {
    return sendJson(response, 404, {
      error: "Profile not found. The user must message the Page first, or you can POST a webhook event."
    });
  }

  const html = renderInvite(profile, {
    eventName: url.searchParams.get("eventName"),
    date: url.searchParams.get("date"),
    time: url.searchParams.get("time"),
    location: url.searchParams.get("location"),
    host: url.searchParams.get("host")
  });

  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(html);
}

function isValidSignature(request, rawBody) {
  if (!config.appSecret) return true;

  const signature = request.headers["x-hub-signature-256"];
  if (!signature || !signature.startsWith("sha256=")) return false;

  const expected = crypto
    .createHmac("sha256", config.appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signature.slice("sha256=".length);

  return timingSafeEqualHex(received, expected);
}

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body, null, 2));
}

function displayName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.psid;
}

function buildPublicUrl(pathname) {
  if (!config.publicBaseUrl) return pathname;
  return new URL(pathname, config.publicBaseUrl).toString();
}
