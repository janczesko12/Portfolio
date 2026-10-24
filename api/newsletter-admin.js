const crypto = require("node:crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const ADMIN_EMAIL = "janczesko12@gmail.com";
const COLLECTION = "newsletter_subscribers";
const DISCORD_URL = "https://discord.gg/invite/test";
const FROM = process.env.NEWSLETTER_FROM || "NovyDev <newsletter@novydev.pl>";
const ALLOWED_ORIGINS = new Set(["https://novydev.pl", "https://www.novydev.pl"]);

function json(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(payload);
}
function getDb() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) throw new Error("Firebase service account is not configured");
  if (!getApps().length) {
    let serviceAccount;
    try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); }
    catch { throw new Error("Firebase service account configuration is invalid"); }
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
  }
  return getFirestore();
}
async function requireAdmin(req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) return null;
  const decoded = await getAuth().verifyIdToken(header.slice(7));
  if (decoded.email !== ADMIN_EMAIL || decoded.email_verified !== true) return null;
  return decoded;
}
function unsubscribeToken(email) {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("Newsletter unsubscribe secret is not configured");
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase() })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
}
module.exports = async function handler(req, res) {
  res.setHeader("Vary", "Origin");
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(res, 403, { ok:false, error:"Origin not allowed" });
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { ok:false, error:"Method not allowed" });
  }
  try {
    const db = getDb();
    const admin = await requireAdmin(req);
    if (!admin) return json(res, 401, { ok:false, error:"Admin authentication required" });
    const snapshot = await db.collection(COLLECTION).get();
    const subscribers = snapshot.docs.map(doc => ({ id:doc.id, ...doc.data() }))
      .filter(s => s.consent === true && s.unsubscribedAt == null && typeof s.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email));
    if (req.method === "GET") {
      return json(res, 200, {
        ok:true, totalDocuments:snapshot.size, eligibleCount:subscribers.length,
        subscribers:subscribers.map(s => ({ email:s.email, createdAt:s.createdAt && typeof s.createdAt.toDate === "function" ? s.createdAt.toDate().toISOString() : null, language:s.language || "pl" }))
      });
    }
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { return json(res,400,{ok:false,error:"Invalid JSON"}); } }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json(res,400,{ok:false,error:"Invalid request"});
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    if (!subject || subject.length > 150 || !message || message.length > 5000) return json(res,400,{ok:false,error:"Subject or message is missing or too long"});
    if (!subscribers.length) return json(res,409,{ok:false,error:"No eligible subscribers found",eligibleCount:0});
    if (body.confirmSend !== true) return json(res,400,{ok:false,error:"Explicit send confirmation required",eligibleCount:subscribers.length});
    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_UNSUBSCRIBE_SECRET) return json(res,503,{ok:false,error:"Resend or unsubscribe configuration is missing"});
    const results = [];
    for (let i=0; i<subscribers.length; i+=100) {
      const chunk = subscribers.slice(i,i+100);
      const emails = chunk.map(s => {
        const token = unsubscribeToken(s.email);
        const unsubscribeUrl = "https://novydev.pl/api/newsletter-unsubscribe?token=" + encodeURIComponent(token);
        const safeMessage = escapeHtml(message).replace(/\n/g,"<br>");
        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px"><tr><td style="padding:30px;font-size:16px;line-height:1.65;color:#172033"><h1 style="font-size:24px;line-height:1.25;color:#172033;margin:0 0 20px">NovyDev</h1><p style="font-size:16px;line-height:1.65;color:#172033">' + safeMessage + '</p><p style="margin:24px 0"><a href="' + DISCORD_URL + '" style="display:inline-block;background:#5865f2;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:9px;font-weight:bold">Dołącz do Discorda</a></p><p style="font-size:12px;line-height:1.5;color:#667085">Otrzymujesz tę wiadomość, ponieważ zapisano Cię do newslettera NovyDev. <a href="' + unsubscribeUrl + '" style="color:#475467">Wypisz się z newslettera</a>.</p></td></tr></table></td></tr></table></body></html>';
        return { from:FROM, to:[s.email], subject, html, text:message + "\n\nDiscord: " + DISCORD_URL + "\n\nWypisz się: " + unsubscribeUrl };
      });
      const response = await fetch("https://api.resend.com/emails/batch", {
        method:"POST", headers:{ Authorization:"Bearer " + process.env.RESEND_API_KEY, "Content-Type":"application/json" },
        body:JSON.stringify(emails)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Newsletter batch failed with status", response.status);
        return json(res,502,{ok:false,error:"Email provider rejected a batch",sentAccepted:results.length,failedBatchSize:chunk.length});
      }
      results.push(...(Array.isArray(data.data) ? data.data : []));
    }
    return json(res,200,{ok:true,eligibleCount:subscribers.length,acceptedCount:results.length,ids:results.map(x=>x.id).filter(Boolean)});
  } catch (error) {
    if (error && ["auth/argument-error","auth/id-token-expired","auth/invalid-id-token"].includes(error.code)) return json(res,401,{ok:false,error:"Invalid or expired login token"});
    console.error("Newsletter admin request failed:", error.message);
    return json(res,500,{ok:false,error:"Newsletter backend is not configured or request failed"});
  }
};
