const crypto = require("node:crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const ADMIN_EMAIL = "janczesko12@gmail.com";
const COLLECTION = "newsletter_subscribers";
const TOPIC_ID = "afdf7bd8-1ec1-47e4-aa3f-b95efde438a5";
const DISCORD_URL = process.env.NEWSLETTER_DISCORD_URL || "";
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
async function hasNewsletterOptIn(email) {
  const headers = { Authorization:"Bearer " + process.env.RESEND_API_KEY, "Content-Type":"application/json" };
  const contactResponse = await fetch("https://api.resend.com/contacts/" + encodeURIComponent(email), { method:"GET", headers });
  if (contactResponse.status === 404) return false;
  if (!contactResponse.ok) throw new Error("Unable to verify a subscriber contact (" + contactResponse.status + ")");
  const contact = await contactResponse.json().catch(() => ({}));
  if (!contact.id || contact.unsubscribed === true) return false;

  const topicsResponse = await fetch("https://api.resend.com/contacts/" + encodeURIComponent(contact.id) + "/topics", { method:"GET", headers });
  if (!topicsResponse.ok) throw new Error("Unable to verify newsletter topic (" + topicsResponse.status + ")");
  const topics = await topicsResponse.json().catch(() => ({}));
  return Array.isArray(topics.data) && topics.data.some(topic => topic.id === TOPIC_ID && topic.subscription === "opt_in");
}
async function onlySubscribedToNewsletter(subscribers) {
  const result = [];
  // Keep parallelism bounded to avoid overwhelming the provider API on larger lists.
  for (let i = 0; i < subscribers.length; i += 20) {
    const group = subscribers.slice(i, i + 20);
    const checked = await Promise.all(group.map(async subscriber => ({
      subscriber,
      active: await hasNewsletterOptIn(subscriber.email)
    })));
    result.push(...checked.filter(item => item.active).map(item => item.subscriber));
  }
  return result;
}
async function ensureSubscriberUnsubscribeId(db, subscriber) {
  const subscriberRef = db.collection(COLLECTION).doc(subscriber.id);
  return db.runTransaction(async transaction => {
    const saved = await transaction.get(subscriberRef);
    if (!saved.exists) return null;
    const current = saved.data();
    if (current.consent !== true || current.unsubscribedAt != null || typeof current.email !== "string") return null;

    let unsubscribeId = current.unsubscribeId;
    let mappingRef = unsubscribeId
      ? db.collection("newsletter_unsubscribe_ids").doc(unsubscribeId)
      : null;
    let mapping = mappingRef ? await transaction.get(mappingRef) : null;
    const mappingData = mapping && mapping.exists ? mapping.data() : null;
    const needsReplacement = !unsubscribeId || !mappingData ||
      mappingData.active !== true || mappingData.email !== current.email;

    if (needsReplacement) {
      if (unsubscribeId) {
        transaction.set(mappingRef, { active: false, replacedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
      unsubscribeId = crypto.randomBytes(32).toString("base64url");
      mappingRef = db.collection("newsletter_unsubscribe_ids").doc(unsubscribeId);
    }

    transaction.set(subscriberRef, { unsubscribeId }, { merge: true });
    transaction.set(mappingRef, {
      email: current.email,
      subscriberId: subscriber.id,
      active: true,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return { ...subscriber, email: current.email, unsubscribeId };
  });
}
async function ensureUnsubscribeIds(db, subscribers) {
  const result = [];
  for (let i = 0; i < subscribers.length; i += 20) {
    const mapped = await Promise.all(subscribers.slice(i, i + 20).map(s => ensureSubscriberUnsubscribeId(db, s)));
    result.push(...mapped.filter(Boolean));
  }
  return result;
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
    let subscribers = snapshot.docs.map(doc => ({ id:doc.id, ...doc.data() }))
      .filter(s => s.consent === true && s.unsubscribedAt == null && typeof s.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email));
    if (!process.env.RESEND_API_KEY) return json(res,503,{ok:false,error:"Resend is not configured"});
    try {
      subscribers = await onlySubscribedToNewsletter(subscribers);
    } catch (verificationError) {
      console.error("Newsletter subscription verification failed:", verificationError.message);
      return json(res,503,{ok:false,error:"Could not verify newsletter subscriptions. No email was sent."});
    }
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
    if (!process.env.RESEND_API_KEY) return json(res,503,{ok:false,error:"Resend is not configured"});
    let mappedSubscribers;
    try {
      mappedSubscribers = await ensureUnsubscribeIds(db, subscribers);
    } catch (mappingError) {
      console.error("Newsletter unsubscribe ID assignment failed:", mappingError.message);
      return json(res,503,{ok:false,error:"Could not prepare unsubscribe links. No email was sent."});
    }
    if (!mappedSubscribers.length) return json(res,409,{ok:false,error:"No active subscribers remained after final verification.",eligibleCount:0});
    const results = [];
    for (let i=0; i<mappedSubscribers.length; i+=100) {
      const chunk = mappedSubscribers.slice(i,i+100);
      const emails = chunk.map(s => {
        const unsubscribeUrl = "https://www.novydev.pl/api/newsletter-unsubscribe?id=" + encodeURIComponent(s.unsubscribeId);
        const safeMessage = escapeHtml(message).replace(/\n/g,"<br>");
        const discordCta = DISCORD_URL ? '<p style="margin:24px 0"><a href="' + escapeHtml(DISCORD_URL) + '" style="display:inline-block;background:#5865f2;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:9px;font-weight:bold">Dołącz do Discorda</a></p>' : '';
        const fallbackUnsubscribeUrl = "https://www.novydev.pl/newsletter-opusc.html";
        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px"><tr><td style="padding:30px;font-size:16px;line-height:1.65;color:#172033"><h1 style="font-size:24px;line-height:1.25;color:#172033;margin:0 0 20px">NovyDev</h1><p style="font-size:16px;line-height:1.65;color:#172033">' + safeMessage + '</p>' + discordCta + '<p style="font-size:12px;line-height:1.5;color:#667085">Otrzymujesz tę wiadomość, ponieważ zapisano Cię do newslettera NovyDev. <a href="' + unsubscribeUrl + '" style="color:#475467">Wypisz się z newslettera</a>. Jeśli link nie działa, <a href="' + fallbackUnsubscribeUrl + '" style="color:#475467">poproś o link rezygnacji</a>.</p></td></tr></table></td></tr></table></body></html>';
        return { from:FROM, to:[s.email], subject, html, text:message + (DISCORD_URL ? "\n\nDiscord: " + DISCORD_URL : "") + "\n\nWypisz się: " + unsubscribeUrl + "\nNie działa link? Poproś o link rezygnacji: " + fallbackUnsubscribeUrl };
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
