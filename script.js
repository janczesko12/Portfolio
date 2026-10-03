const portfolio = {
  email: "janczesko12@gmail.com",
  github: "https://github.com/janczesko12",
  projects: [
    {
      icon: "AI",
      title: "AI Agent",
      description: "Agent z GUI, integracją modeli AI i lokalnym fallbackiem — eksperyment z automatyzacją zadań i pracą na modelach lokalnych.",
      tags: ["Python", "AI", "Gemini", "Ollama"],
      link: "#"
    },
    {
      icon: "APP",
      title: "ListaZakupów",
      description: "Mobilna aplikacja z listą produktów, kontami użytkowników i synchronizacją danych w chmurze.",
      tags: ["Kotlin", "Compose", "Firebase", "Firestore"],
      link: "#"
    },
    {
      icon: "BOT",
      title: "JanBot",
      description: "Discord bot z ekonomią, XP, moderacją i bazą danych — modułowa architektura oparta o cogi.",
      tags: ["Python", "discord.py", "SQLite", "Bot"],
      link: "#"
    },
    {
      icon: "CV",
      title: "Computer Vision / ALPR",
      description: "Eksperymenty z rozpoznawaniem tablic, kamerą IP, OpenCV i OCR oraz integracją z własnym serwerem.",
      tags: ["Python", "OpenCV", "OCR", "Flask"],
      link: "#"
    },
    {
      icon: "GAME",
      title: "Roblox Projects",
      description: "Mechaniki gier, systemy ekonomii, farming, DataStore, UI i narzędzia rozwijane w Roblox Studio.",
      tags: ["Roblox", "Lua", "Game Dev", "DataStore"],
      link: "#"
    },
    {
      icon: "IOT",
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
    <div class="project-icon">${escapeHtml(project.icon)}</div>
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
