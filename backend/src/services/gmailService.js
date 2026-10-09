"use strict";
/**
 * gmailService.js
 * ─────────────────────────────────────────────────────────────────────────────
<<<<<<< HEAD
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
=======
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
>>>>>>> main/A1
 */

const { google } = require("googleapis");

<<<<<<< HEAD
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
=======
// ── Scope: minimum required to send mail on behalf of the user ──
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

/**
 * Check that all required env vars are present.
 * Returns an array of missing variable names (empty = all present).
 */
function missingCredentials() {
  const required = [
>>>>>>> main/A1
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_SENDER_ADDRESS",
<<<<<<< HEAD
  ].filter((k) => !process.env[k] || !process.env[k].trim());
}

// ── OAuth2 client ─────────────────────────────────────────────

/**
 * Build an OAuth2 client pre-loaded with the stored refresh token.
 * No network call is made here; the access token is fetched on demand.
 *
 * @returns {import('google-auth-library').OAuth2Client}
=======
  ];
  return required.filter((k) => !process.env[k] || process.env[k].trim() === "");
}

/**
 * Build a configured OAuth2 client pre-loaded with the stored refresh token.
 * Does NOT make a network call; the access token is fetched lazily by googleapis.
 *
 * @returns {import('googleapis').Auth.OAuth2Client}
>>>>>>> main/A1
 */
function buildOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID.trim(),
    process.env.GMAIL_CLIENT_SECRET.trim(),
<<<<<<< HEAD
    // Redirect URI — not used in server-side refresh flows but required by
    // the constructor. Must match one of the URIs registered in Google Cloud.
    "https://developers.google.com/oauthplayground"
  );
=======
    // Redirect URI is not used for server-side token refresh flows,
    // but the constructor requires a value — use the standard OOB URI.
    "https://developers.google.com/oauthplayground"
  );

>>>>>>> main/A1
  client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN.trim(),
    scope:         GMAIL_SEND_SCOPE,
  });
<<<<<<< HEAD
  return client;
}

// ── MIME construction ─────────────────────────────────────────

/**
 * Encode a UTF-8 string to Base64URL (required by the Gmail API raw message
 * field). Standard Base64 uses + / =; Base64URL substitutes - _ and drops =.
 *
 * @param {string} str
=======

  return client;
}

/**
 * Encode a string to Base64URL (the variant required by the Gmail API).
 * Standard Base64 uses + / =; Base64URL uses - _ and omits padding.
 *
 * @param {string} str — UTF-8 string to encode
>>>>>>> main/A1
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
<<<<<<< HEAD
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
=======
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
>>>>>>> main/A1
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
<<<<<<< HEAD
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
=======
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
>>>>>>> main/A1
  // 1. Validate configuration ──────────────────────────────────
  const missing = missingCredentials();
  if (missing.length > 0) {
    console.error("[GmailService] Missing env vars:", missing.join(", "));
<<<<<<< HEAD
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
=======
    throw new Error(`Gmail API not configured. Missing: ${missing.join(", ")}`);
  }

  const senderAddress = process.env.GMAIL_SENDER_ADDRESS.trim();
  const fromHeader    = `"CNPS Public School" <${senderAddress}>`;
>>>>>>> main/A1

  // 2. Build OAuth2 client ─────────────────────────────────────
  let auth;
  try {
    auth = buildOAuth2Client();
  } catch (err) {
    console.error("[GmailService] OAuth2 client construction failed:", err.message);
    throw new Error("Gmail OAuth2 client initialisation failed.");
  }

<<<<<<< HEAD
  // 3. Obtain access token ─────────────────────────────────────
  //    getAccessToken() hits Google's token endpoint over HTTPS — fast,
  //    typically < 1 s.  Fails immediately on bad credentials instead of
  //    waiting 120 s for a TCP timeout like SMTP.
=======
  // 3. Verify the refresh token can produce an access token ────
  //    getAccessToken() calls Google's token endpoint; fails fast (< 5 s)
  //    before we even try to send — no 120-second SMTP timeout.
>>>>>>> main/A1
  let accessTokenResult;
  try {
    accessTokenResult = await auth.getAccessToken();
  } catch (tokenErr) {
<<<<<<< HEAD
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
=======
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
>>>>>>> main/A1
  }

  if (!accessTokenResult?.token) {
    console.error("[GmailService] Access token response was empty.");
    throw new Error("Gmail access token response was empty.");
  }
  console.log("[GmailService] Access token obtained OK");

<<<<<<< HEAD
  // 4. Build MIME message ──────────────────────────────────────
  const rawMessage = buildRawMessage({
    from:    fromHeader,
    to,
    subject,
    text:    plainText,
    html,
  });

  // 5. Send via Gmail API ──────────────────────────────────────
=======
  // 4. Build the MIME message ───────────────────────────────────
  const rawMessage = buildRawMessage({ from: fromHeader, to, subject, html });

  // 5. Call the Gmail API ──────────────────────────────────────
>>>>>>> main/A1
  const gmail = google.gmail({ version: "v1", auth });

  let response;
  try {
    response = await gmail.users.messages.send({
<<<<<<< HEAD
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
=======
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

>>>>>>> main/A1
  return { messageId: gmailMessageId };
}

module.exports = { sendEmail, missingCredentials };
