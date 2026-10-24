const crypto = require("node:crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const TOPIC_ID = "afdf7bd8-1ec1-47e4-aa3f-b95efde438a5";
const REASONS = new Set([
  "too_many",
  "not_relevant",
  "signed_up_by_mistake",
  "content_changed",
  "other_channels",
  "inbox_clutter",
  "other"
]);

function db() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !process.env.NEWSLETTER_UNSUBSCRIBE_SECRET) {
    throw new Error("Unsubscribe backend is not configured");
  }
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
  }
  return getFirestore();
}

function isJsonRequest(req) {
  return String(req.headers.accept || "").includes("application/json") ||
    String(req.headers["content-type"] || "").includes("application/json");
}

function json(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(payload);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c];
  });
}

function fallbackPage(res, status, title, message) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  return res.status(status).send(
    '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#08090d"><title>' + safeTitle + ' — NovyDev</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:#08090d;color:#f3f5f7;font:16px/1.65 system-ui,sans-serif}.card{width:min(100%,560px);padding:36px;border:1px solid #ffffff1a;border-radius:24px;background:#10121a}h1{line-height:1.1;letter-spacing:-.04em}a{display:inline-block;margin-top:12px;color:#b7ff4a}.mark{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#b7ff4a;color:#08090d;font-weight:900;margin-right:8px}</style></head><body><main class="card"><p><span class="mark">N</span><strong>NOVYDEV</strong></p><h1>' + safeTitle + '</h1><p>' + safeMessage + '</p><a href="/">Wróć na NovyDev ↗</a></main></body></html>'
  );
}

function parseToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("Unsubscribe secret is not configured");

  const expected = crypto.createHmac("sha256", secret).update(parts[0]).digest();
  let supplied;
  try { supplied = Buffer.from(parts[1], "base64url"); } catch { return null; }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (typeof payload.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return null;
    return payload.email.toLowerCase();
  } catch { return null; }
}

function readBody(req) {
  if (typeof req.body === "string") {
    const contentType = String(req.headers["content-type"] || "");
    if (contentType.includes("application/json")) {
      try { return JSON.parse(req.body); } catch { return null; }
    }
    return Object.fromEntries(new URLSearchParams(req.body).entries());
  }
  if (Buffer.isBuffer(req.body)) {
    return Object.fromEntries(new URLSearchParams(req.body.toString("utf8")).entries());
  }
  return req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
}

async function syncResendOptOut(email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const headers = { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" };
  const lookup = await fetch("https://api.resend.com/contacts/" + encodeURIComponent(email), {
    method: "GET", headers
  });
  if (lookup.status === 404) return true;
  if (!lookup.ok) throw new Error("Resend contact lookup failed (" + lookup.status + ")");
  const contact = await lookup.json().catch(function () { return {}; });
  if (!contact.id) throw new Error("Resend contact ID was missing");

  const topicResponse = await fetch("https://api.resend.com/contacts/" + encodeURIComponent(contact.id) + "/topics", {
    method: "PATCH",
    headers,
    body: JSON.stringify([{ id: TOPIC_ID, subscription: "opt_out" }])
  });
  if (!topicResponse.ok) throw new Error("Resend topic opt-out failed (" + topicResponse.status + ")");

  const contactResponse = await fetch("https://api.resend.com/contacts/" + encodeURIComponent(contact.id), {
    method: "PATCH",
    headers,
    body: JSON.stringify({ unsubscribed: true })
  });
  if (!contactResponse.ok) throw new Error("Resend contact opt-out failed (" + contactResponse.status + ")");
  return true;
}

module.exports = async function handler(req, res) {
  const wantsJson = isJsonRequest(req);

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    if (wantsJson) return json(res, 405, { ok: false, error: "Method not allowed" });
    return fallbackPage(res, 405, "Nie można wykonać tej akcji", "Otwórz link z wiadomości newslettera.");
  }

  try {
    if (req.method === "GET") {
      const token = req.query && req.query.token;
      if (!parseToken(token)) {
        return fallbackPage(res, 400, "Link jest nieprawidłowy", "Ten link do rezygnacji jest nieprawidłowy lub wygasł. Otwórz najnowszą wiadomość od NovyDev.");
      }
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Referrer-Policy", "no-referrer");
      res.statusCode = 302;
      res.setHeader("Location", "/rezygnacja.html?token=" + encodeURIComponent(String(token)));
      return res.end();
    }

    const body = readBody(req);
    const email = parseToken(body && body.token);
    if (!email) {
      if (wantsJson) return json(res, 400, { ok: false, error: "Link rezygnacji jest nieprawidłowy lub wygasł." });
      return fallbackPage(res, 400, "Link jest nieprawidłowy", "Ten link do rezygnacji jest nieprawidłowy lub wygasł. Otwórz najnowszą wiadomość od NovyDev.");
    }

    const id = crypto.createHash("sha256").update(email).digest("hex");
    const firestore = db();
    await firestore.collection("newsletter_subscribers").doc(id).set({
      consent: false,
      unsubscribedAt: new Date()
    }, { merge: true });

    const reason = REASONS.has(String(body.reason || "")) ? String(body.reason) : "";
    const comment = String(body.comment || "").trim().slice(0, 500);
    if (reason || comment) {
      try {
        await firestore.collection("newsletter_unsubscribe_feedback").doc(id).set({
          emailHash: id,
          reason: reason || null,
          comment: comment || null,
          createdAt: new Date()
        }, { merge: true });
      } catch (feedbackError) {
        console.error("Newsletter feedback save failed:", feedbackError.message);
      }
    }

    let providerSynced = false;
    try {
      providerSynced = await syncResendOptOut(email);
    } catch (syncError) {
      // Firestore has already opted the address out of the website's newsletter.
      console.error("Resend unsubscribe sync failed:", syncError.message);
    }

    if (wantsJson) return json(res, 200, { ok: true, providerSynced });
    return fallbackPage(res, 200, "Wypisano z newslettera", "Twoja rezygnacja została zapisana. Nie będziemy wysyłać Ci kolejnych wiadomości z newslettera NovyDev.");
  } catch (error) {
    console.error("Newsletter unsubscribe failed:", error.message);
    if (wantsJson) return json(res, 500, { ok: false, error: "Nie udało się teraz zapisać rezygnacji. Spróbuj ponownie za chwilę." });
    return fallbackPage(res, 500, "Nie udało się zapisać rezygnacji", "Spróbuj ponownie za chwilę. Jeśli problem się powtórzy, skontaktuj się z NovyDev.");
  }
};
