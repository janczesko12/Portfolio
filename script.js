const portfolio = {
  email: "janczesko12@gmail.com",
  github: "https://github.com/janczesko12",
  projects: [
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6 37.7 24.3 56 30l-18.3 5.7L32 54l-5.7-18.3L8 30l18.3-5.7L32 6Z" fill="currentColor"/><path d="M50 6 52 12l6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="currentColor" opacity=".75"/></svg>`,
      title: "AI Agent",
      description: "Agent z GUI, integracją modeli AI i lokalnym fallbackiem — eksperyment z automatyzacją zadań i pracą na modelach lokalnych.",
      tags: ["Python", "AI", "Gemini", "Ollama"],
      link: "#"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 21h32l-2.2 34H18.2L16 21Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M24 23v-3a8 8 0 0 1 16 0v3" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M25 34h14" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M31 28v12" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>`,
      title: "ListaZakupów",
      description: "Mobilna aplikacja z listą produktów, kontami użytkowników i synchronizacją danych w chmurze.",
      tags: ["Kotlin", "Compose", "Firebase", "Firestore"],
      link: "#"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 19h28c5.5 0 10 4.5 10 10v9c0 10-8 18-18 18H26C16 56 8 48 8 38v-9c0-5.5 4.5-10 10-10Z" fill="currentColor"/><circle cx="24" cy="34" r="4" fill="#0b0d0a"/><circle cx="40" cy="34" r="4" fill="#0b0d0a"/><path d="M25 44c4 2.5 10 2.5 14 0" fill="none" stroke="#0b0d0a" stroke-width="3.5" stroke-linecap="round"/><path d="M32 19v-7" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="9" r="3" fill="currentColor"/></svg>`,
      title: "JanBot",
      description: "Discord bot z ekonomią, XP, moderacją i bazą danych — modułowa architektura oparta o cogi.",
      tags: ["Python", "discord.py", "SQLite", "Bot"],
      link: "#"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="7" y="17" width="50" height="33" rx="7" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="33.5" r="10" fill="none" stroke="currentColor" stroke-width="5"/><path d="M23 17l4-6h10l4 6" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M14 45h36" stroke="currentColor" stroke-width="3" opacity=".65"/></svg>`,
      title: "Computer Vision / ALPR",
      description: "Eksperymenty z rozpoznawaniem tablic, kamerą IP, OpenCV i OCR oraz integracją z własnym serwerem.",
      tags: ["Python", "OpenCV", "OCR", "Flask"],
      link: "#"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m22 15 20-5 7 27-20 5-7-27Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="m31 22 10-2.5 2.5 10L33.5 32 31 22Z" fill="currentColor"/></svg>`,
      title: "Roblox Projects",
      description: "Mechaniki gier, systemy ekonomii, farming, DataStore, UI i narzędzia rozwijane w Roblox Studio.",
      tags: ["Roblox", "Lua", "Game Dev", "DataStore"],
      link: "#"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 31a20 20 0 0 1 24 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M14 23a29 29 0 0 1 36 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".65"/><circle cx="32" cy="43" r="6" fill="currentColor"/><path d="M32 49v7" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
      title: "Smart Gaming Setup",
      description: "Automatyzacje sterujące oświetleniem i urządzeniami na podstawie uruchomionej gry lub stanu komputera.",
      tags: ["PowerShell", "IoT", "Tuya", "Automation"],
      link: "#"
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
    <a class="project-link" href="${escapeHtml(project.link)}">więcej ↗</a>
  </article>
`).join("");

document.querySelector("#email-link").href = `mailto:${portfolio.email}`;
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
