import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const ADMIN_EMAIL = "janczesko12@gmail.com";
const firebaseConfig = {
  apiKey: "AIzaSyAXb7y95RcEi5OkLL4AsQSYBEFYXu3qrvc",
  authDomain: "portfolio-395d6.firebaseapp.com",
  projectId: "portfolio-395d6",
  storageBucket: "portfolio-395d6.firebasestorage.app",
  messagingSenderId: "931360195608",
  appId: "1:931360195608:web:03b2b9b09e09e022cfaf6d",
  measurementId: "G-60PLFSNEFM"
};
const app = initializeApp(firebaseConfig, "novydev-newsletter-admin");
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const $ = selector => document.querySelector(selector);
const loginButton = $("#login-button"), authArea = $("#auth-area"), workspace = $("#admin-workspace");
const message = $("#admin-message"), count = $("#subscriber-count"), list = $("#subscriber-list");
const form = $("#newsletter-compose"), sendButton = $("#send-newsletter");
let currentUser = null, subscriberCount = 0;

function showMessage(text, type = "") { message.textContent = text; message.className = "admin-message " + type; }
function isAdmin(user) { return !!user && user.email?.toLowerCase() === ADMIN_EMAIL && user.emailVerified; }
function element(tag, text, className) { const el=document.createElement(tag);el.textContent=text||"";if(className)el.className=className;return el; }
async function api(path, options = {}) {
  const token = await currentUser.getIdToken();
  const response = await fetch(path, {
    ...options,
    headers: { Authorization:"Bearer "+token, ...(options.headers||{}) }
  });
  const data = await response.json().catch(()=>({}));
  if (!response.ok || data.ok !== true) throw new Error(data.error || "Żądanie nie powiodło się.");
  return data;
}
async function loadSubscribers() {
  list.replaceChildren();
  count.textContent = "…";
  try {
    const data = await api("/api/newsletter-admin");
    subscriberCount = data.eligibleCount || 0;
    count.textContent = String(subscriberCount);
    if (!data.subscribers?.length) {
      list.append(element("p","Brak zapisanych adresów w Firestore.","newsletter-note"));
      return;
    }
    data.subscribers.forEach(item => {
      const row = element("div",item.email,"newsletter-subscriber");
      if (item.createdAt) row.title = "Zapisano: " + new Date(item.createdAt).toLocaleString("pl-PL");
      list.append(row);
    });
    showMessage("Lista została odświeżona.","success");
  } catch (error) {
    count.textContent = "—";
    list.replaceChildren(element("p","Nie udało się odczytać listy.","newsletter-note"));
    showMessage(error.message,"error");
  }
}
loginButton.addEventListener("click",async()=>{try{await signInWithPopup(auth,provider);}catch(error){showMessage("Logowanie nie powiodło się: "+error.message,"error");}});
$("#refresh-subscribers").addEventListener("click",loadSubscribers);
form.addEventListener("submit",async event=>{
  event.preventDefault();
  if (!isAdmin(currentUser)) { showMessage("Brak uprawnień administratora.","error"); return; }
  const subject=$("#newsletter-subject").value.trim(), body=$("#newsletter-message").value.trim();
  if(!subject||!body)return;
  if(!subscriberCount){showMessage("Brak aktywnych subskrybentów do wysłania.","error");return;}
  const confirmed=window.confirm("Wysłać tę wiadomość do "+subscriberCount+" adresów z aktywną zgodą?\n\nTemat: "+subject+"\n\nTa operacja wyśle prawdziwe e-maile.");
  if(!confirmed)return;
  sendButton.disabled=true;sendButton.textContent="Wysyłanie…";
  try{
    const result=await api("/api/newsletter-admin",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({subject,message:body,confirmSend:true})
    });
    showMessage("Wysłano do dostawcy e-maili: "+result.acceptedCount+" z "+result.eligibleCount+". Sprawdź logi Resend, aby potwierdzić dostarczenie.","success");
  }catch(error){showMessage("Nie udało się wysłać: "+error.message,"error");}
  finally{sendButton.disabled=false;sendButton.textContent="Przygotuj wysyłkę";await loadSubscribers();}
});
onAuthStateChanged(auth,async user=>{
  currentUser=user;authArea.replaceChildren();
  if(!user){
    const button=element("button","Zaloguj się kontem Google","btn btn-primary");button.type="button";button.addEventListener("click",()=>loginButton.click());authArea.append(button);
    workspace.hidden=true;showMessage("Zaloguj się zweryfikowanym kontem administratora.");return;
  }
  if(!isAdmin(user)){
    workspace.hidden=true;showMessage("To konto nie ma uprawnień do panelu newslettera.","error");
    authArea.append(element("span","Zalogowano jako "+(user.email||"nieznane konto")+" · ","admin-user"));
    const logout=element("button","Wyloguj","btn btn-ghost");logout.type="button";logout.addEventListener("click",()=>signOut(auth));authArea.append(logout);return;
  }
  authArea.append(element("span","Administrator: "+user.email+" · ","admin-user"));
  const logout=element("button","Wyloguj","btn btn-ghost");logout.type="button";logout.addEventListener("click",()=>signOut(auth));authArea.append(logout);
  workspace.hidden=false;showMessage("Zalogowano. Wczytuję listę subskrybentów.","success");await loadSubscribers();
});
