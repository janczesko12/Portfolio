const portfolio = {
  email: "janczesko12@gmail.com",
  github: "https://github.com/janczesko12",
  projects: [
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6 37.7 24.3 56 30l-18.3 5.7L32 54l-5.7-18.3L8 30l18.3-5.7L32 6Z" fill="currentColor"/><path d="M50 6 52 12l6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="currentColor" opacity=".75"/></svg>`,
      title: "AI Agent",
      description: "Agent z GUI, integracją modeli AI i lokalnym fallbackiem. Projekt skupia się na uruchamianiu poleceń, komunikacji z modelami oraz płynnym przełączaniu się między usługą online i modelem lokalnym.",
      features: ["Graficzny interfejs do pracy z agentem", "Obsługa modeli online i lokalnych", "Fallback do Ollama przy ograniczeniach API", "Eksperymenty z automatyzacją zadań"],
      tags: ["Python", "AI", "Gemini", "Ollama"],
      link: "https://github.com/janczesko12/mythoria"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 21h32l-2.2 34H18.2L16 21Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M24 23v-3a8 8 0 0 1 16 0v3" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M25 34h14" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M31 28v12" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>`,
      title: "ListaZakupów",
      description: "Mobilna aplikacja do tworzenia i synchronizowania list zakupów. Projekt łączy nowoczesny interfejs Compose z kontami użytkowników i chmurą Firebase.",
      features: ["Lista produktów z oznaczaniem kupionych pozycji", "Logowanie i osobne dane użytkowników", "Synchronizacja przez Firestore", "Zakupy pogrupowane według sklepów", "Integracja Android + backend Firebase"],
      tags: ["Kotlin", "Compose", "Firebase", "Firestore"],
      link: "https://github.com/janczesko12/ListaZakupow"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 19h28c5.5 0 10 4.5 10 10v9c0 10-8 18-18 18H26C16 56 8 48 8 38v-9c0-5.5 4.5-10 10-10Z" fill="currentColor"/><circle cx="24" cy="34" r="4" fill="#0b0d0a"/><circle cx="40" cy="34" r="4" fill="#0b0d0a"/><path d="M25 44c4 2.5 10 2.5 14 0" fill="none" stroke="#0b0d0a" stroke-width="3.5" stroke-linecap="round"/><path d="M32 19v-7" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="9" r="3" fill="currentColor"/></svg>`,
      title: "JanBot",
      description: "Modułowy bot Discord z systemem ekonomii, XP, moderacją i bazą danych. Poszczególne funkcje są rozdzielone na cogi, dzięki czemu projekt można łatwo rozwijać.",
      features: ["Komendy użytkowe i pomoc", "System XP i poziomów", "Ekonomia serwera", "Moderacja i narzędzia administracyjne", "Baza danych SQLite / aiosqlite", "Architektura oparta o cogi"],
      tags: ["Python", "discord.py", "SQLite", "Bot"],
      link: "https://github.com/janczesko12/JanBot"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="7" y="17" width="50" height="33" rx="7" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="33.5" r="10" fill="none" stroke="currentColor" stroke-width="5"/><path d="M23 17l4-6h10l4 6" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M14 45h36" stroke="currentColor" stroke-width="3" opacity=".65"/></svg>`,
      title: "Computer Vision / ALPR",
      description: "Eksperymenty z rozpoznawaniem tablic rejestracyjnych z wykorzystaniem obrazu z kamery. Projekt łączy OpenCV, OCR i własny serwer Flask.",
      features: ["Pobieranie obrazu z kamery IP / ESP32-CAM", "Przetwarzanie klatek przez OpenCV", "Rozpoznawanie tekstu z użyciem OCR", "Testy automatycznego odczytu tablic", "Własne endpointy serwera Flask"],
      tags: ["Python", "OpenCV", "OCR", "Flask"],
      link: "https://github.com/janczesko12/roblox-friends-api"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m22 15 20-5 7 27-20 5-7-27Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="m31 22 10-2.5 2.5 10L33.5 32 31 22Z" fill="currentColor"/></svg>`,
      title: "Roblox Projects",
      description: "Zestaw projektów Roblox Studio obejmujący mechaniki gier, ekonomię, farming, GUI, DataStore i narzędzia budowane z myślą o rozgrywce multiplayer.",
      features: ["Systemy działek i przypisywania gracza", "Farming i wzrost upraw", "Ekonomia oraz sprzedaż przedmiotów", "GUI i RemoteEvents", "Zapisywanie postępów przez DataStore", "Mechaniki gier tworzonych w Roblox Studio"],
      tags: ["Roblox", "Lua", "Game Dev", "DataStore"],
      link: "https://github.com/janczesko12/roblox-game"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 31a20 20 0 0 1 24 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M14 23a29 29 0 0 1 36 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".65"/><circle cx="32" cy="43" r="6" fill="currentColor"/><path d="M32 49v7" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
      title: "Smart Gaming Setup",
      description: "Automatyzacje łączące komputer, gry i inteligentne oświetlenie. Skrypty wykrywają uruchomioną aplikację i zmieniają stan oświetlenia zależnie od aktywnego trybu.",
      features: ["Wykrywanie uruchomionych gier", "Automatyczne przełączanie scen LED", "Integracja z urządzeniami Tuya / CozyLife", "Skrypty PowerShell do automatyzacji", "Osobne profile kolorów dla różnych gier"],
      tags: ["PowerShell", "IoT", "Tuya", "Automation"],
      link: "https://github.com/janczesko12/mythoria"
    }
  ]
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const projectsGrid = document.querySelector("#projects-grid");
projectsGrid.innerHTML = portfolio.projects.map((project, index) => `
  <article class="project-card reveal" style="animation-delay:${0.05 * index}s">
    <span class="project-index">0${index + 1}</span>
    <div class="project-icon">${project.icon}</div>
    <h3>${escapeHtml(project.title)}</h3>
    <p>${escapeHtml(project.description)}</p>
    <div class="project-tags">${project.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    <button class="project-link" type="button" data-project-index="${index}">więcej ↗</button>
  </article>
`).join("");

const emailLink = document.querySelector("#email-link");
emailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(portfolio.email)}`;
emailLink.target = "_blank";
emailLink.rel = "noopener noreferrer";
document.querySelector("#github-link").href = portfolio.github;
document.querySelector("#year").textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));


const projectModal = document.querySelector("#project-modal");
const modalIcon = document.querySelector("#modal-project-icon");
const modalTitle = document.querySelector("#modal-project-title");
const modalDescription = document.querySelector("#modal-project-description");
const modalFeatures = document.querySelector("#modal-project-features");
const modalTags = document.querySelector("#modal-project-tags");
const modalProjectLink = document.querySelector("#modal-project-link");

function openProjectModal(index) {
  const project = portfolio.projects[index];
  if (!project) return;
  modalIcon.innerHTML = project.icon;
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalFeatures.innerHTML = project.features.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  modalTags.innerHTML = project.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
  if (project.link === "#") {
    modalProjectLink.classList.add("is-disabled");
    modalProjectLink.removeAttribute("href");
    modalProjectLink.textContent = "Link w przygotowaniu";
  } else {
    modalProjectLink.classList.remove("is-disabled");
    modalProjectLink.href = project.link;
    modalProjectLink.innerHTML = `Otwórz projekt <span>↗</span>`;
  }
  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector(".modal-close").focus();
}

function closeProjectModal() {
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-project-index]");
  if (projectButton) openProjectModal(Number(projectButton.dataset.projectIndex));
  if (event.target.closest("[data-close-modal]")) closeProjectModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectModal.classList.contains("open")) closeProjectModal();
});


const translations = {
  pl: { aboutKicker:"O MNIE", aboutTitle:"Technologia jako narzędzie, nie cel.", projectsKicker:"PROJEKTY", projectsTitle:"Rzeczy, które faktycznie zbudowałem." },
  en: { aboutKicker:"ABOUT ME", aboutTitle:"Technology as a tool, not a goal.", projectsKicker:"PROJECTS", projectsTitle:"Things I actually built." }
};
let currentLanguage = localStorage.getItem("mythoria-language") || "pl";
const languageToggle = document.querySelector("#language-toggle");
function applyLanguage() {
  const t = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t[el.dataset.i18n] || el.textContent; });
  languageToggle.textContent = currentLanguage === "pl" ? "EN" : "PL";
}
languageToggle.addEventListener("click", () => { currentLanguage = currentLanguage === "pl" ? "en" : "pl"; localStorage.setItem("mythoria-language", currentLanguage); applyLanguage(); });
applyLanguage();

fetch("https://api.github.com/users/janczesko12").then(r=>r.json()).then(data=>{
  if(data.public_repos) document.querySelector("#stat-repos").textContent = data.public_repos;
  if(typeof data.followers === "number") document.querySelector("#stat-followers").textContent = data.followers;
}).catch(()=>{});

const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiIndex = 0;
document.addEventListener("keydown", e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if(key === konami[konamiIndex]) { konamiIndex++; if(konamiIndex === konami.length) { konamiIndex=0; document.body.classList.add("mythoria-easter"); setTimeout(()=>document.body.classList.remove("mythoria-easter"),5000); } }
  else konamiIndex = 0;
});

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
