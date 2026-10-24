// Server-only Vercel endpoint for newsletter signups. Never expose RESEND_API_KEY in browser code.
const SEGMENT_ID = "e9633da0-6357-4769-b1d8-64d7e529bd50";
const TOPIC_ID = "afdf7bd8-1ec1-47e4-aa3f-b95efde438a5";
const ALLOWED_ORIGINS = new Set(["https://novydev.pl", "https://www.novydev.pl"]);
const recentRequests = globalThis.__novydevNewsletterRequests || (globalThis.__novydevNewsletterRequests = new Map());

function sendJson(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(payload);
}

async function resendRequest(path, method, body) {
  const response = await fetch("https://api.resend.com" + path, {
    method,
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function rateLimited(key) {
  const now = Date.now();
  for (const [savedKey, expiresAt] of recentRequests) {
    if (expiresAt <= now) recentRequests.delete(savedKey);
  }
  const previousExpiry = recentRequests.get(key);
  if (previousExpiry && previousExpiry > now) return true;
  recentRequests.set(key, now + 15000);
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader("Vary", "Origin");
  const origin = req.headers.origin;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false });
  }
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return sendJson(res, 403, { ok: false });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return sendJson(res, 400, { ok: false }); }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendJson(res, 400, { ok: false });
  }
  if (String(body.company || "").trim()) return sendJson(res, 200, { ok: true });

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return sendJson(res, 429, { ok: false });

  const email = String(body.email || "").trim().toLowerCase();
  if (email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(res, 400, { ok: false });
  }
  if (body.consent !== true) return sendJson(res, 400, { ok: false });
  if (!process.env.RESEND_API_KEY) return sendJson(res, 503, { ok: false });

  const contactPath = "/contacts/" + encodeURIComponent(email);
  try {
    // Check for an existing contact so repeated signups don't create duplicates.
    const existing = await resendRequest(contactPath, "GET");
    if (existing.status === 404) {
      const created = await resendRequest("/contacts", "POST", { email, unsubscribed: false });
      if (!created.ok) {
        // If a parallel request created the contact, continue with the existing-contact path.
        if (created.status !== 409) throw new Error("contact create failed (" + created.status + ")");
      }
    } else if (!existing.ok) {
      throw new Error("contact lookup failed (" + existing.status + ")");
    }

    // The visitor just gave fresh explicit consent in the unchecked form checkbox.
    const updated = await resendRequest(contactPath, "PATCH", { unsubscribed: false });
    if (!updated.ok) throw new Error("contact update failed (" + updated.status + ")");

    const segment = await resendRequest(contactPath + "/segments/" + SEGMENT_ID, "POST");
    if (!segment.ok && segment.status !== 409) throw new Error("segment update failed (" + segment.status + ")");

    const topic = await resendRequest(contactPath + "/topics", "PATCH", {
      topics: [{ id: TOPIC_ID, subscription: "opt_in" }]
    });
    if (!topic.ok) throw new Error("topic update failed (" + topic.status + ")");

    // Mirror the consented subscriber to Firestore for the private admin API.
    // Configure FIREBASE_SERVICE_ACCOUNT_JSON in Vercel to enable this sync.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const crypto = require("node:crypto");
      const { initializeApp, cert, getApps } = require("firebase-admin/app");
      const { getFirestore, FieldValue } = require("firebase-admin/firestore");
      if (!getApps().length) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
      }
      const subscriberId = crypto.createHash("sha256").update(email).digest("hex");
      await getFirestore().collection("newsletter_subscribers").doc(subscriberId).set({
        email,
        consent: true,
        createdAt: FieldValue.serverTimestamp(),
        language: body.language === "en" ? "en" : "pl",
        source: "novydev.pl",
        unsubscribedAt: null
      }, { merge: true });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    // Never log the submitted email address or any secret.
    console.error("Newsletter sync failed:", error.message);
    return sendJson(res, 502, { ok: false });
  }
};
