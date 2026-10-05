import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXb7y95RcEi5OkLL4AsQSYBEFYXu3qrvc",
  authDomain: "portfolio-395d6.firebaseapp.com",
  projectId: "portfolio-395d6",
  storageBucket: "portfolio-395d6.firebasestorage.app",
  messagingSenderId: "931360195608",
  appId: "1:931360195608:web:03b2b9b09e09e022cfaf6d",
  measurementId: "G-60PLFSNEFM"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (_) {}
const db = getFirestore(app);
const ratingsRef = collection(db, "portfolio_ratings");

const form = document.querySelector("#rating-form");
const stars = [...document.querySelectorAll(".rating-star")];
const selected = document.querySelector("#rating-selected");
const comment = document.querySelector("#rating-comment");
const message = document.querySelector("#rating-message");
const average = document.querySelector("#rating-average");
const averageStars = document.querySelector("#rating-average-stars");
const count = document.querySelector("#rating-count");

let chosen = 0;

const style = document.createElement("style");
style.textContent = `
.ratings-section{position:relative}
.ratings-card{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;padding:34px;border:1px solid var(--line);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));box-shadow:var(--shadow)}
.rating-summary{display:flex;align-items:center;gap:14px;margin-top:24px;flex-wrap:wrap}
.rating-summary strong{font-size:2.3rem;line-height:1;color:var(--accent)}
.rating-stars{color:var(--accent);font-size:1.25rem;letter-spacing:2px}
.rating-summary small{color:var(--muted)}
.rating-dashboard-link{display:inline-block;margin-top:18px;color:var(--accent);font-size:.85rem}
.rating-form{display:grid;gap:14px;align-content:start}
.rating-choice{display:flex;gap:6px}
.rating-star{width:42px;height:42px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025);color:#555d6d;font-size:1.45rem;cursor:pointer;transition:.18s}
.rating-star:hover,.rating-star.active{color:var(--accent);border-color:rgba(183,255,74,.45);background:rgba(183,255,74,.08);transform:translateY(-2px)}
.rating-selected{font-size:.82rem;color:var(--muted)}
.rating-form label{display:grid;gap:8px;color:var(--muted);font-size:.8rem}
.rating-form textarea{width:100%;resize:vertical;min-height:105px;padding:13px;border:1px solid var(--line);border-radius:13px;background:rgba(0,0,0,.18);color:var(--text);font:inherit;outline:none}
.rating-form textarea:focus{border-color:rgba(183,255,74,.5)}
.rating-submit:disabled{opacity:.55;cursor:not-allowed;transform:none}
.rating-message{min-height:22px;margin:0;font-size:.82rem;color:var(--muted)}
.rating-message.success{color:var(--accent)}
.rating-message.error{color:#ff8585}
@media(max-width:760px){.ratings-card{grid-template-columns:1fr;padding:24px}.rating-star{width:40px;height:40px}}
`;
document.head.appendChild(style);

function paint(value) {
  stars.forEach(star => star.classList.toggle("active", Number(star.dataset.rating) <= value));
}

function showMessage(text, type = "") {
  if (!message) return;
  message.textContent = text;
  message.className = "rating-message " + type;
}

async function recordVisit() {
  const visitDoc = doc(db, "portfolio_stats", "visits");
  const alreadyCounted = sessionStorage.getItem("mythoria-visit-counted") === "1";
  try {
    if (!alreadyCounted) {
      await setDoc(visitDoc, { count: increment(1) }, { merge: true });
      sessionStorage.setItem("mythoria-visit-counted", "1");
    }
    const snapshot = await getDoc(visitDoc);
    const visits = Number(snapshot.data()?.count || 0);
    const stat = document.querySelector("#stat-visits");
    if (stat) stat.textContent = visits.toLocaleString("pl-PL");
  } catch (error) {
    console.warn("Nie udało się zaktualizować licznika odwiedzin:", error);
  }
}

async function loadSummary() {
  try {
    const snapshot = await getDocs(ratingsRef);
    const rows = snapshot.docs.map(doc => doc.data()).filter(row => Number(row.rating) >= 1 && Number(row.rating) <= 5);
    count.textContent = rows.length;

    if (!rows.length) {
      average.textContent = "—";
      averageStars.textContent = "☆☆☆☆☆";
      return;
    }

    const avg = rows.reduce((sum, row) => sum + Number(row.rating), 0) / rows.length;
    const rounded = Math.round(avg);
    average.textContent = avg.toFixed(1).replace(".", ",");
    averageStars.textContent = "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
  } catch (error) {
    console.error("Nie udało się pobrać ocen:", error);
  }
}

stars.forEach(star => {
  star.addEventListener("mouseenter", () => paint(Number(star.dataset.rating)));
  star.addEventListener("mouseleave", () => paint(chosen));
  star.addEventListener("click", () => {
    chosen = Number(star.dataset.rating);
    paint(chosen);
    selected.textContent = chosen + "/5";
  });
});

form?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!chosen) {
    showMessage("Najpierw wybierz ocenę.", "error");
    return;
  }

  if (localStorage.getItem("mythoria-rated") === "1") {
    showMessage("Z tego urządzenia ocena została już wysłana.");
    return;
  }

  const submit = form.querySelector(".rating-submit");
  submit.disabled = true;
  showMessage("Zapisywanie…");

  try {
    await addDoc(ratingsRef, {
      rating: chosen,
      comment: comment.value.trim().slice(0, 300),
      createdAt: serverTimestamp(),
      language: document.documentElement.lang || "pl"
    });

    localStorage.setItem("mythoria-rated", "1");
    showMessage("Dziękuję za ocenę! ⭐", "success");
    form.reset();
    chosen = 0;
    paint(0);
    selected.textContent = "Wybierz ocenę 1–5";
    await recordVisit();
loadSummary();
  } catch (error) {
    console.error(error);
    showMessage("Nie udało się zapisać oceny. Sprawdź reguły Firestore.", "error");
  } finally {
    submit.disabled = false;
  }
});

if (localStorage.getItem("mythoria-rated") === "1") {
  showMessage("Ocena z tego urządzenia została już wysłana.");
}

loadSummary();
