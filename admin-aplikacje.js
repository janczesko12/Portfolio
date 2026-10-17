import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig, "novydev-admin");
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const $ = selector => document.querySelector(selector);
const loginButton = $("#login-button"), authArea = $("#auth-area"), workspace = $("#admin-workspace");
const message = $("#admin-message"), list = $("#admin-list"), form = $("#app-form");
const fields = {
  id: $("#app-id"), name: $("#app-name"), platform: $("#app-platform"), version: $("#app-version"),
  order: $("#app-order"), description: $("#app-description"), image: $("#app-image"),
  download: $("#app-download"), website: $("#app-website"), button: $("#app-button"), published: $("#app-published")
};
let currentUser = null, applications = [];

function showMessage(text, type = "") { message.textContent = text; message.className = "admin-message " + type; }
function isAdmin(user) { return !!user && user.email?.toLowerCase() === ADMIN_EMAIL && user.emailVerified; }
function validWebUrl(value, optional = false) {
  if (!value && optional) return true;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}
function textEl(tag, text, className) { const el = document.createElement(tag); el.textContent = text || ""; if (className) el.className = className; return el; }
function renderList() {
  list.replaceChildren();
  if (!applications.length) { list.append(textEl("p","Nie ma jeszcze żadnych aplikacji. Kliknij „Dodaj aplikację”.","admin-empty")); return; }
  applications.forEach(item => {
    const row = document.createElement("article"); row.className = "admin-app-row";
    const thumb = document.createElement("div"); thumb.className = "admin-thumb";
    if (validWebUrl(item.imageUrl, true) && item.imageUrl) { const img = document.createElement("img"); img.src = item.imageUrl; img.alt = ""; img.onerror = () => { thumb.textContent = (item.name || "A").slice(0,1); }; thumb.append(img); } else thumb.textContent = (item.name || "A").slice(0,1);
    const info = document.createElement("div"); info.className = "admin-app-info";
    info.append(textEl("strong",item.name),textEl("span",(item.published ? "Opublikowana" : "Ukryta") + " · kolejność " + (item.sortOrder ?? 100)));
    const edit = textEl("button","Edytuj","btn btn-ghost"); edit.type = "button"; edit.addEventListener("click",()=>fillForm(item));
    row.append(thumb,info,edit); list.append(row);
  });
}
function resetForm() { form.reset(); fields.id.value=""; fields.order.value="100"; fields.button.value="Pobierz aplikację"; fields.published.checked=true; $("#form-heading").textContent="Nowa aplikacja"; $("#delete-app").hidden=true; $("#image-preview").textContent="Podgląd ikony"; form.hidden=true; }
function fillForm(item) {
  fields.id.value=item.id; fields.name.value=item.name || ""; fields.platform.value=item.platform || ""; fields.version.value=item.version || "";
  fields.order.value=Number.isFinite(Number(item.sortOrder)) ? item.sortOrder : 100; fields.description.value=item.description || "";
  fields.image.value=item.imageUrl || ""; fields.download.value=item.downloadUrl || ""; fields.website.value=item.websiteUrl || "";
  fields.button.value=item.buttonLabel || "Pobierz aplikację"; fields.published.checked=item.published === true;
  $("#form-heading").textContent="Edytuj: "+item.name; $("#delete-app").hidden=false; form.hidden=false; updatePreview();
  form.scrollIntoView({behavior:"smooth",block:"start"});
}
function updatePreview() {
  const preview=$("#image-preview"); preview.replaceChildren();
  if (validWebUrl(fields.image.value,true) && fields.image.value) { const img=document.createElement("img"); img.src=fields.image.value; img.alt="Podgląd ikony"; img.onerror=()=>{preview.textContent="Nie udało się wczytać obrazu";}; preview.append(img); }
  else preview.textContent="Podgląd ikony pojawi się po wklejeniu adresu HTTPS.";
}
async function loadApps() {
  const snap=await getDocs(query(collection(db,"applications"),orderBy("sortOrder","asc")));
  applications=snap.docs.map(d=>({id:d.id,...d.data()})); renderList();
}
loginButton.addEventListener("click",async()=>{
  try { await signInWithPopup(auth,provider); }
  catch(error) { showMessage("Logowanie nie powiodło się: "+error.message,"error"); }
});
$("#new-app").addEventListener("click",()=>{resetForm();form.hidden=false;form.scrollIntoView({behavior:"smooth",block:"start"});});
$("#cancel-edit").addEventListener("click",resetForm);
fields.image.addEventListener("input",updatePreview);
form.addEventListener("submit",async event=>{
  event.preventDefault();
  if (!isAdmin(currentUser)) { showMessage("Brak uprawnień administratora.","error"); return; }
  const name=fields.name.value.trim(), description=fields.description.value.trim();
  if (!name || !description) return;
  for (const [field,label,optional] of [[fields.image,"ikony",true],[fields.download,"pobierania",true],[fields.website,"strony",true]]) {
    if (!validWebUrl(field.value.trim(),optional)) { showMessage("Nieprawidłowy adres URL: "+label+". Użyj adresu HTTP lub HTTPS.","error");field.focus();return; }
  }
  const payload={
    name, description, platform:fields.platform.value.trim(), version:fields.version.value.trim(),
    sortOrder:Math.max(-100000,Math.min(100000,Number.parseInt(fields.order.value,10)||0)),
    imageUrl:fields.image.value.trim(), downloadUrl:fields.download.value.trim(), websiteUrl:fields.website.value.trim(),
    buttonLabel:fields.button.value.trim()||"Pobierz aplikację", published:fields.published.checked,
    updatedAt:serverTimestamp(), updatedBy:currentUser.uid
  };
  try {
    if(fields.id.value) await setDoc(doc(db,"applications",fields.id.value),payload,{merge:true});
    else await addDoc(collection(db,"applications"),{...payload,createdAt:serverTimestamp(),createdBy:currentUser.uid});
    showMessage("Zapisano aplikację.","success");resetForm();await loadApps();
  } catch(error) { console.error(error);showMessage("Nie udało się zapisać. Sprawdź, czy reguły Firestore zostały opublikowane i czy to konto administratora.","error"); }
});
$("#delete-app").addEventListener("click",async()=>{
  const id=fields.id.value, name=fields.name.value;
  if(!id || !isAdmin(currentUser)) return;
  if(!confirm('Usunąć aplikację "'+name+'"? Tej operacji nie można cofnąć.')) return;
  try { await deleteDoc(doc(db,"applications",id));showMessage("Usunięto aplikację.","success");resetForm();await loadApps(); }
  catch(error) { console.error(error);showMessage("Nie udało się usunąć aplikacji. Sprawdź reguły Firestore.","error"); }
});
onAuthStateChanged(auth,async user=>{
  currentUser=user;
  authArea.replaceChildren();
  if(!user) {
    const button=textEl("button","Zaloguj się kontem Google","btn btn-primary");button.type="button";button.addEventListener("click",()=>loginButton.click());authArea.append(button);
    workspace.hidden=true;showMessage("Zaloguj się kontem administratora, aby zarządzać aplikacjami.");return;
  }
  if(!isAdmin(user)) {
    workspace.hidden=true;showMessage("To konto nie ma uprawnień do panelu administratora.","error");
    const label=textEl("span","Zalogowano jako "+(user.email||"nieznane konto")+" · ","admin-user");
    const logout=textEl("button","Wyloguj","btn btn-ghost");logout.type="button";logout.addEventListener("click",()=>signOut(auth));authArea.append(label,logout);return;
  }
  const label=textEl("span","Administrator: "+user.email+" · ","admin-user");
  const logout=textEl("button","Wyloguj","btn btn-ghost");logout.type="button";logout.addEventListener("click",()=>signOut(auth));authArea.append(label,logout);
  workspace.hidden=false;showMessage("Zalogowano. Zmiany są zapisywane w katalogu aplikacji.","success");
  try { await loadApps(); } catch(error) { console.error(error);showMessage("Nie udało się odczytać aplikacji. Opublikuj reguły Firestore z pliku firestore.rules.","error"); }
});
