"use strict";
/**
 * gmailService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends email through the Gmail API over HTTPS using OAuth 2.0.
 * This avoids SMTP entirely — no TCP port 587/465 needed.
 *
 * Required environment variables (set on Render):
 *   GMAIL_CLIENT_ID       — OAuth 2.0 client ID from Google Cloud Console
 *   GMAIL_CLIENT_SECRET   — OAuth 2.0 client secret
 *   GMAIL_REFRESH_TOKEN   — Offline refresh token from OAuth consent flow
 *   GMAIL_SENDER_ADDRESS  — Gmail address authorised for sending (e.g. alokat9084@gmail.com)
 *
 * The service:
 *   1. Builds an OAuth2 client from the stored refresh token.
 *   2. Exchanges the refresh token for a fresh access token on every call
 *      (Google access tokens expire after 1 hour; refresh tokens are long-lived).
 *   3. Constructs a standards-compliant RFC 2822 MIME message.
 *   4. Base64URL-encodes the full message (required by Gmail API).
 *   5. Calls gmail.users.messages.send with the encoded message.
 *   6. Returns { messageId } on success or throws a descriptive Error on failure.
 *
 * Security:
 *   - Credentials are read from env vars only — never hardcoded.
 *   - Access tokens are obtained fresh per request — not cached on disk.
 *   - Refresh tokens, client secrets, and access tokens are never logged.
 *   - Only the Gmail "send" scope is requested (minimum required permission).
 */

const { google } = require("googleapis");

// ── Scope: minimum required to send mail on behalf of the user ──
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

/**
 * Check that all required env vars are present.
 * Returns an array of missing variable names (empty = all present).
 */
function missingCredentials() {
  const required = [
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_SENDER_ADDRESS",
  ];
  return required.filter((k) => !process.env[k] || process.env[k].trim() === "");
}

/**
 * Build a configured OAuth2 client pre-loaded with the stored refresh token.
 * Does NOT make a network call; the access token is fetched lazily by googleapis.
 *
 * @returns {import('googleapis').Auth.OAuth2Client}
 */
function buildOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID.trim(),
    process.env.GMAIL_CLIENT_SECRET.trim(),
    // Redirect URI is not used for server-side token refresh flows,
    // but the constructor requires a value — use the standard OOB URI.
    "https://developers.google.com/oauthplayground"
  );

  client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN.trim(),
    scope:         GMAIL_SEND_SCOPE,
  });

  return client;
}

/**
 * Encode a string to Base64URL (the variant required by the Gmail API).
 * Standard Base64 uses + / =; Base64URL uses - _ and omits padding.
 *
 * @param {string} str — UTF-8 string to encode
 * @returns {string}
 */
function toBase64Url(str) {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Build a minimal RFC 2822 MIME message string.
 * Gmail API requires the full raw message (headers + body) Base64URL-encoded.
 *
 * @param {object} opts
 * @param {string} opts.from    — "Name" <address>
 * @param {string} opts.to      — recipient address
 * @param {string} opts.subject
 * @param {string} opts.html    — HTML body
 * @returns {string} Base64URL-encoded raw MIME message
 */
function buildRawMessage({ from, to, subject, html }) {
  // Encode the subject as RFC 2047 UTF-8 encoded-word so non-ASCII survives.
  const encodedSubject = `=?utf-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;

  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    // Body must also be Base64-encoded when using Content-Transfer-Encoding: base64
    Buffer.from(html, "utf8").toString("base64"),
  ].join("\r\n");

  return toBase64Url(mime);
}

/**
 * Send an email through the Gmail API.
 *
 * @param {object} opts
 * @param {string} opts.to       — recipient address
 * @param {string} opts.subject
 * @param {string} opts.html     — full HTML body string
 * @returns {Promise<{ messageId: string }>}
 * @throws {Error} with a safe, descriptive message (no secrets in .message)
 */
async function sendEmail({ to, subject, html }) {
  // 1. Validate configuration ──────────────────────────────────
  const missing = missingCredentials();
  if (missing.length > 0) {
    console.error("[GmailService] Missing env vars:", missing.join(", "));
    throw new Error(`Gmail API not configured. Missing: ${missing.join(", ")}`);
  }

  const senderAddress = process.env.GMAIL_SENDER_ADDRESS.trim();
  const fromHeader    = `"CNPS Public School" <${senderAddress}>`;

  // 2. Build OAuth2 client ─────────────────────────────────────
  let auth;
  try {
    auth = buildOAuth2Client();
  } catch (err) {
    console.error("[GmailService] OAuth2 client construction failed:", err.message);
    throw new Error("Gmail OAuth2 client initialisation failed.");
  }

  // 3. Verify the refresh token can produce an access token ────
  //    getAccessToken() calls Google's token endpoint; fails fast (< 5 s)
  //    before we even try to send — no 120-second SMTP timeout.
  let accessTokenResult;
  try {
    accessTokenResult = await auth.getAccessToken();
  } catch (tokenErr) {
    // Classify common OAuth errors for actionable Render log messages.
    const msg    = (tokenErr.message || "").toLowerCase();
    const detail = tokenErr.response?.data?.error || tokenErr.code || tokenErr.message;
    if (msg.includes("invalid_grant") || msg.includes("token has been expired or revoked")) {
      console.error("[GmailService] Refresh token expired or revoked — generate a new one. detail:", detail);
      throw new Error("Gmail refresh token expired. Regenerate it in Google Cloud Console.");
    }
    if (msg.includes("invalid_client")) {
      console.error("[GmailService] OAuth2 client ID/secret rejected — check GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET. detail:", detail);
      throw new Error("Gmail OAuth2 client credentials rejected.");
    }
    console.error("[GmailService] Access token fetch failed — detail:", detail);
    throw new Error(`Gmail access token error: ${detail}`);
  }

  if (!accessTokenResult?.token) {
    console.error("[GmailService] Access token response was empty.");
    throw new Error("Gmail access token response was empty.");
  }
  console.log("[GmailService] Access token obtained OK");

  // 4. Build the MIME message ───────────────────────────────────
  const rawMessage = buildRawMessage({ from: fromHeader, to, subject, html });

  // 5. Call the Gmail API ──────────────────────────────────────
  const gmail = google.gmail({ version: "v1", auth });

  let response;
  try {
    response = await gmail.users.messages.send({
      userId:      "me",   // "me" = the authenticated sender
      requestBody: { raw: rawMessage },
    });
  } catch (apiErr) {
    // Extract the safe parts of the Google API error for logging.
    const status  = apiErr.response?.status;
    const errCode = apiErr.response?.data?.error;
    const errMsg  = apiErr.response?.data?.error_description || apiErr.message;
    console.error(`[GmailService] API send failed — HTTP ${status} | error: ${errCode} | message: ${errMsg}`);

    if (status === 401) throw new Error("Gmail API: authentication failed (401). Check OAuth credentials.");
    if (status === 403) throw new Error("Gmail API: permission denied (403). Ensure Gmail send scope is authorised.");
    if (status === 429) throw new Error("Gmail API: rate limit exceeded (429). Try again shortly.");
    throw new Error(`Gmail API send error (HTTP ${status ?? "unknown"}): ${errMsg}`);
  }

  // 6. Confirm acceptance ──────────────────────────────────────
  const gmailMessageId = response?.data?.id;
  console.log("[GmailService] Message accepted — Gmail message ID:", gmailMessageId ?? "(none returned)");

  return { messageId: gmailMessageId };
}

module.exports = { sendEmail, missingCredentials };
