"use strict";
/**
 * gmailService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends email via the Gmail API over HTTPS using OAuth 2.0.
 * Avoids SMTP entirely — no outbound TCP port 587 or 465 required.
 * Render (and most PaaS) block those ports; port 443 (HTTPS) is always open.
 *
 * Required environment variables:
 *   GMAIL_CLIENT_ID       — OAuth 2.0 client ID  (Google Cloud Console)
 *   GMAIL_CLIENT_SECRET   — OAuth 2.0 client secret
 *   GMAIL_REFRESH_TOKEN   — Long-lived refresh token from OAuth consent flow
 *   GMAIL_SENDER_ADDRESS  — Gmail address authorised for sending
 *
 * Security contract:
 *   - Credentials are read from env vars only; never hardcoded.
 *   - A fresh access token is obtained on every call (no on-disk cache).
 *   - Refresh token, client secret, and access token are never logged.
 *   - Only the minimum "gmail.send" scope is requested.
 *   - sendEmail() always throws on failure — callers must not swallow errors.
 */

const { google } = require("googleapis");

const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

// ── Configuration check ───────────────────────────────────────

/**
 * Returns an array of required env var names that are missing or empty.
 * Empty array means all credentials are present.
 *
 * @returns {string[]}
 */
function missingCredentials() {
  return [
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_SENDER_ADDRESS",
  ].filter((k) => !process.env[k] || !process.env[k].trim());
}

// ── OAuth2 client ─────────────────────────────────────────────

/**
 * Build an OAuth2 client pre-loaded with the stored refresh token.
 * No network call is made here; the access token is fetched on demand.
 *
 * @returns {import('google-auth-library').OAuth2Client}
 */
function buildOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID.trim(),
    process.env.GMAIL_CLIENT_SECRET.trim(),
    // Redirect URI — not used in server-side refresh flows but required by
    // the constructor. Must match one of the URIs registered in Google Cloud.
    "https://developers.google.com/oauthplayground"
  );
  client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN.trim(),
    scope:         GMAIL_SEND_SCOPE,
  });
  return client;
}

// ── MIME construction ─────────────────────────────────────────

/**
 * Encode a UTF-8 string to Base64URL (required by the Gmail API raw message
 * field). Standard Base64 uses + / =; Base64URL substitutes - _ and drops =.
 *
 * @param {string} str
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
 * Build a multipart/alternative MIME message that contains both a
 * plain-text fallback and an HTML part.  The full message is
 * Base64URL-encoded so it can be submitted to gmail.users.messages.send.
 *
 * @param {object} opts
 * @param {string} opts.from     — RFC 2822 From header, e.g. "Name" <addr>
 * @param {string} opts.to       — recipient address
 * @param {string} opts.subject  — email subject (UTF-8, any chars)
 * @param {string} opts.text     — plain-text body
 * @param {string} opts.html     — HTML body
 * @returns {string} Base64URL-encoded raw MIME message
 */
function buildRawMessage({ from, to, subject, text, html }) {
  // RFC 2047 encoded-word for the subject so non-ASCII is preserved.
  const encodedSubject =
    "=?utf-8?B?" + Buffer.from(subject, "utf8").toString("base64") + "?=";

  // A fixed boundary string — does not need to be cryptographically random.
  const boundary = "cnps_mime_boundary_xK9mL3pQ";

  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(text, "utf8").toString("base64"),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html, "utf8").toString("base64"),
    "",
    `--${boundary}--`,
  ];

  return toBase64Url(lines.join("\r\n"));
}

// ── Public API ────────────────────────────────────────────────

/**
 * Send an email via the Gmail API.
 *
 * @param {object} opts
 * @param {string} opts.to       — recipient address
 * @param {string} opts.subject  — email subject
 * @param {string} opts.html     — HTML body
 * @param {string} [opts.text]   — plain-text body (auto-generated from html if omitted)
 * @returns {Promise<{ messageId: string }>}
 * @throws {Error} — safe message string, no secrets included
 */
async function sendEmail({ to, subject, html, text }) {
  // 1. Validate configuration ──────────────────────────────────
  const missing = missingCredentials();
  if (missing.length > 0) {
    console.error("[GmailService] Missing env vars:", missing.join(", "));
    throw new Error("Gmail API not configured. Missing: " + missing.join(", "));
  }

  const senderAddress = process.env.GMAIL_SENDER_ADDRESS.trim();
  const fromHeader    = '"CNPS Public School" <' + senderAddress + ">";

  // Plain-text fallback: strip HTML tags if no text body provided.
  const plainText = text ||
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  // 2. Build OAuth2 client ─────────────────────────────────────
  let auth;
  try {
    auth = buildOAuth2Client();
  } catch (err) {
    console.error("[GmailService] OAuth2 client construction failed:", err.message);
    throw new Error("Gmail OAuth2 client initialisation failed.");
  }

  // 3. Obtain access token ─────────────────────────────────────
  //    getAccessToken() hits Google's token endpoint over HTTPS — fast,
  //    typically < 1 s.  Fails immediately on bad credentials instead of
  //    waiting 120 s for a TCP timeout like SMTP.
  let accessTokenResult;
  try {
    accessTokenResult = await auth.getAccessToken();
  } catch (tokenErr) {
    const detail = tokenErr.response?.data?.error || tokenErr.code || tokenErr.message;
    const msg    = (tokenErr.message || "").toLowerCase();

    if (msg.includes("invalid_grant") || msg.includes("token has been expired")) {
      console.error("[GmailService] Refresh token expired/revoked — detail:", detail);
      throw new Error("Gmail refresh token expired. Regenerate it in Google Cloud Console.");
    }
    if (msg.includes("invalid_client")) {
      console.error("[GmailService] OAuth2 client credentials rejected — check GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET. detail:", detail);
      throw new Error("Gmail OAuth2 client credentials rejected.");
    }
    console.error("[GmailService] Access token fetch failed — detail:", detail);
    throw new Error("Gmail access token error: " + detail);
  }

  if (!accessTokenResult?.token) {
    console.error("[GmailService] Access token response was empty.");
    throw new Error("Gmail access token response was empty.");
  }
  console.log("[GmailService] Access token obtained OK");

  // 4. Build MIME message ──────────────────────────────────────
  const rawMessage = buildRawMessage({
    from:    fromHeader,
    to,
    subject,
    text:    plainText,
    html,
  });

  // 5. Send via Gmail API ──────────────────────────────────────
  const gmail = google.gmail({ version: "v1", auth });

  let response;
  try {
    response = await gmail.users.messages.send({
      userId:      "me",
      requestBody: { raw: rawMessage },
    });
  } catch (apiErr) {
    const status  = apiErr.response?.status;
    const errCode = apiErr.response?.data?.error;
    const errMsg  = apiErr.response?.data?.error_description || apiErr.message;
    console.error(
      "[GmailService] API send failed — HTTP", status,
      "| error:", errCode,
      "| message:", errMsg
    );
    if (status === 401) throw new Error("Gmail API: authentication failed (401). Check OAuth credentials.");
    if (status === 403) throw new Error("Gmail API: permission denied (403). Ensure gmail.send scope is authorised.");
    if (status === 429) throw new Error("Gmail API: rate limit exceeded (429). Try again shortly.");
    throw new Error("Gmail API send error (HTTP " + (status ?? "unknown") + "): " + errMsg);
  }

  // 6. Return result ───────────────────────────────────────────
  const gmailMessageId = response?.data?.id;
  console.log(
    "[GmailService] Message accepted — Gmail ID:", gmailMessageId ?? "(none)",
    "| to:", to
  );
  return { messageId: gmailMessageId };
}

module.exports = { sendEmail, missingCredentials };
