import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXb7y95RcEi5OkLL4AsQSYBEFYXu3qrvc",
  authDomain: "portfolio-395d6.firebaseapp.com",
  projectId: "portfolio-395d6",
  storageBucket: "portfolio-395d6.firebasestorage.app",
  messagingSenderId: "931360195608",
  appId: "1:931360195608:web:03b2b9b09e09e022cfaf6d",
  measurementId: "G-60PLFSNEFM"
};
const app = initializeApp(firebaseConfig, "novydev-app-catalog");
const db = getFirestore(app);
const grid = document.querySelector("#apps-grid");
const status = document.querySelector("#apps-status");

function safeUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
function renderCard(item) {
  const card = document.createElement("article");
  card.className = "app-card";
  const media = document.createElement("div"); media.className = "app-card-media";
  const imageUrl = safeUrl(item.imageUrl || "");
  if (imageUrl) {
    const img = document.createElement("img"); img.src = imageUrl; img.alt = "Ikona aplikacji " + item.name; img.loading = "lazy";
    img.onerror = () => { media.replaceChildren(); const placeholder = document.createElement("div"); placeholder.className = "app-card-placeholder"; placeholder.textContent = (item.name || "A").slice(0,1).toUpperCase(); media.append(placeholder); };
    media.append(img);
  } else { const placeholder = document.createElement("div"); placeholder.className = "app-card-placeholder"; placeholder.textContent = (item.name || "A").slice(0,1).toUpperCase(); media.append(placeholder); }
  const body = document.createElement("div"); body.className = "app-card-content";
  const meta = document.createElement("div"); meta.className = "app-card-meta";
  if (item.platform) { const pill = document.createElement("span"); pill.className = "app-pill"; pill.textContent = item.platform; meta.append(pill); }
  if (item.version) { const pill = document.createElement("span"); pill.className = "app-pill"; pill.textContent = "Wersja " + item.version; meta.append(pill); }
  const title = document.createElement("h2"); title.textContent = item.name || "Aplikacja";
  const desc = document.createElement("p"); desc.textContent = item.description || "";
  body.append(meta,title,desc);
  const actions = document.createElement("div"); actions.className = "app-card-actions";
  const download = safeUrl(item.downloadUrl || "");
  if (download) { const a = document.createElement("a"); a.className = "btn btn-primary"; a.href = download; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = item.buttonLabel || "Pobierz aplikację"; actions.append(a); }
  const details = safeUrl(item.websiteUrl || "");
  if (details) { const a = document.createElement("a"); a.className = "btn btn-ghost"; a.href = details; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Strona aplikacji"; actions.append(a); }
  body.append(actions); card.append(media,body); return card;
}
try {
  const snapshot = await getDocs(query(collection(db, "applications"), orderBy("sortOrder", "asc")));
  const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.published === true);
  grid.replaceChildren();
  if (!apps.length) {
    status.textContent = "Lista aplikacji jest gotowa. Wkrótce pojawią się tutaj pierwsze pozycje.";
    const empty = document.createElement("div"); empty.className = "app-empty"; empty.textContent = "Brak opublikowanych aplikacji."; grid.append(empty);
  } else {
    status.textContent = apps.length + (apps.length === 1 ? " aplikacja" : " aplikacje");
    apps.forEach(item => grid.append(renderCard(item)));
  }
} catch (error) {
  console.error(error);
  status.textContent = "Nie udało się pobrać listy. Konfiguracja Firebase lub reguły Firestore wymagają sprawdzenia.";
}
