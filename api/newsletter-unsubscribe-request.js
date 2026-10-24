const crypto = require("node:crypto");

const TOPIC_ID = "afdf7bd8-1ec1-47e4-aa3f-b95efde438a5";
const ALLOWED_ORIGINS = new Set(["https://novydev.pl", "https://www.novydev.pl"]);
const RECENT = globalThis.__novydevUnsubscribeRequests || (globalThis.__novydevUnsubscribeRequests = new Map());

function sendJson(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(data);
}

function createToken(email) {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("Unsubscribe signing key is not configured");
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase() })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}

function isRateLimited(key) {
  const now = Date.now();
  for (const [saved, expires] of RECENT) if (expires <= now) RECENT.delete(saved);
  if ((RECENT.get(key) || 0) > now) return true;
  RECENT.set(key, now + 30000);
  return false;
}

async function resend(path, method, body) {
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

module.exports = async function handler(req, res) {
  res.setHeader("Vary", "Origin");
  const origin = req.headers.origin;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return sendJson(res, 403, { ok: false });
  if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_UNSUBSCRIBE_SECRET) {
    return sendJson(res, 503, { ok: false, error: "Newsletter preferences are temporarily unavailable." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return sendJson(res, 400, { ok: false, error: "Invalid request." }); }
  }
  const email = String(body && body.email || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(res, 400, { ok: false, error: "Enter a valid email address." });
  }

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const key = crypto.createHash("sha256").update(ip + "|" + email).digest("hex");
  if (isRateLimited(key)) {
    return sendJson(res, 200, { ok: true, message: "If this address is subscribed, a confirmation email will arrive shortly." });
  }

  try {
    const found = await resend("/contacts/" + encodeURIComponent(email), "GET");
    if (!found.ok || found.data.unsubscribed === true || !found.data.id) {
      return sendJson(res, 200, { ok: true, message: "If this address is subscribed, a confirmation email will arrive shortly." });
    }

    const topicResult = await resend("/contacts/" + encodeURIComponent(found.data.id) + "/topics", "GET");
    if (!topicResult.ok) throw new Error("Could not read topic subscription (" + topicResult.status + ")");
    const subscriptions = Array.isArray(topicResult.data.data) ? topicResult.data.data : [];
    const isSubscribed = subscriptions.some(topic => topic.id === TOPIC_ID && topic.subscription === "opt_in");
    if (!isSubscribed) {
      return sendJson(res, 200, { ok: true, message: "If this address is subscribed, a confirmation email will arrive shortly." });
    }

    const token = createToken(email);
    const confirmUrl = "https://www.novydev.pl/api/newsletter-unsubscribe?token=" + encodeURIComponent(token);
    const emailHtml = '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#08090d;color:#f3f5f7;font-family:Arial,Helvetica,sans-serif;padding:30px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#10121a;border:1px solid #ffffff1a;border-radius:18px"><tr><td style="padding:30px"><p style="font-size:13px;letter-spacing:2px;font-weight:bold;color:#b7ff4a">NOVYDEV</p><h1 style="font-size:25px;line-height:1.2">Potwierdź rezygnację</h1><p style="font-size:16px;line-height:1.7;color:#c5cad3">Otrzymaliśmy prośbę o wypisanie tego adresu z newslettera NovyDev. Kliknij przycisk poniżej, aby potwierdzić decyzję i — opcjonalnie — podać jej powód.</p><p style="margin:28px 0"><a href="' + confirmUrl + '" style="display:inline-block;background:#b7ff4a;color:#08090d;text-decoration:none;font-weight:bold;padding:13px 20px;border-radius:10px">Potwierdź wypisanie ↗</a></p><p style="font-size:12px;line-height:1.6;color:#8e97a8">Jeśli to nie Ty poprosiłeś(-aś) o rezygnację, zignoruj tę wiadomość. Twój zapis pozostanie bez zmian.</p></td></tr></table></td></tr></table></body></html>';
    const emailText = "NOVYDEV\n\nPotwierdź rezygnację z newslettera NovyDev.\n\nOtwórz ten link, aby potwierdzić decyzję i opcjonalnie podać powód:\n" + confirmUrl + "\n\nJeśli to nie Ty poprosiłeś(-aś) o rezygnację, zignoruj tę wiadomość.";
    const sent = await resend("/emails", "POST", {
      from: "NovyDev <newsletter@novydev.pl>",
      to: [email],
      subject: "Potwierdź rezygnację z newslettera NovyDev",
      html: emailHtml,
      text: emailText
    });
    if (!sent.ok) throw new Error("Confirmation email failed (" + sent.status + ")");
    return sendJson(res, 200, {
      ok: true,
      message: "If this address is subscribed, a confirmation email will arrive shortly."
    });
  } catch (error) {
    console.error("Unsubscribe request failed:", error.message);
    return sendJson(res, 500, { ok: false, error: "Could not send a confirmation email right now. Please try again later." });
  }
};
