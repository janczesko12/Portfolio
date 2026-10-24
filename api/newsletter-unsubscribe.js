const crypto = require("node:crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
function db() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !process.env.NEWSLETTER_UNSUBSCRIBE_SECRET) throw new Error("Unsubscribe backend is not configured");
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({ credential:cert(serviceAccount), projectId:serviceAccount.project_id });
  }
  return getFirestore();
}
function parseToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac("sha256",process.env.NEWSLETTER_UNSUBSCRIBE_SECRET).update(parts[0]).digest();
  let supplied;
  try { supplied = Buffer.from(parts[1],"base64url"); } catch { return null; }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied,expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0],"base64url").toString("utf8"));
    if (typeof payload.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return null;
    return payload.email.toLowerCase();
  } catch { return null; }
}
function page(res, status, title, message, token = "") {
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.setHeader("Cache-Control","no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
  const safeToken = token.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
  return res.status(status).send('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><body style="font-family:Arial,sans-serif;max-width:560px;margin:12vh auto;padding:24px;color:#172033"><h1>'+title+'</h1><p>'+message+'</p>'+(token ? '<form method="post" action="/api/newsletter-unsubscribe"><input type="hidden" name="token" value="'+safeToken+'"><button style="background:#5865f2;color:white;border:0;border-radius:8px;padding:12px 18px;font-size:16px" type="submit">Potwierdź wypisanie</button></form>' : '')+'</body></html>');
}
module.exports = async function handler(req,res) {
  if (req.method !== "GET" && req.method !== "POST") { res.setHeader("Allow","GET, POST"); return page(res,405,"Niedozwolona metoda","Użyj linku z wiadomości."); }
  try {
    const token = req.method === "GET" ? req.query.token : (typeof req.body === "string" ? new URLSearchParams(req.body).get("token") : req.body?.token);
    const email = parseToken(token);
    if (!email) return page(res,400,"Nieprawidłowy link","Ten link do wypisania jest nieprawidłowy.");
    if (req.method === "GET") return page(res,200,"Wypisanie z newslettera","Kliknij przycisk poniżej, aby potwierdzić wypisanie z newslettera NovyDev.",String(token));
    const id = crypto.createHash("sha256").update(email).digest("hex");
    await db().collection("newsletter_subscribers").doc(id).set({ consent:false, unsubscribedAt:new Date() },{merge:true});
    return page(res,200,"Wypisano z newslettera","Adres został wypisany z newslettera NovyDev.");
  } catch (error) {
    console.error("Newsletter unsubscribe failed:",error.message);
    return page(res,500,"Błąd serwera","Nie udało się teraz przetworzyć wypisania. Spróbuj później.");
  }
};
