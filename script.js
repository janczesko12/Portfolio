const portfolio = {
  email: "janczesko12@gmail.com",
  github: "https://github.com/janczesko12",
  projects: [
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6 37.7 24.3 56 30l-18.3 5.7L32 54l-5.7-18.3L8 30l18.3-5.7L32 6Z" fill="currentColor"/><path d="M50 6 52 12l6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="currentColor" opacity=".75"/></svg>`,
      title: { pl:"AI Agent", en:"AI Agent" },
      status:{pl:"Eksperymentalny",en:"Experimental"},
      description: { pl:"Agent z GUI, integracją modeli AI i lokalnym fallbackiem. Projekt skupia się na uruchamianiu poleceń, komunikacji z modelami oraz płynnym przełączaniu się między usługą online i modelem lokalnym.", en:"An agent with a GUI, AI model integrations and a local fallback. The project focuses on running commands, communicating with models and smoothly switching between online services and a local model." },
      features: { pl:["Graficzny interfejs do pracy z agentem","Obsługa modeli online i lokalnych","Fallback do Ollama przy ograniczeniach API","Eksperymenty z automatyzacją zadań"], en:["Graphical interface for working with the agent","Support for online and local models","Ollama fallback when API limits are reached","Experiments with task automation"] },
      tags:["Python","AI","Gemini","Ollama"],
      link:"https://github.com/janczesko12/mythoria"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 21h32l-2.2 34H18.2L16 21Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M24 23v-3a8 8 0 0 1 16 0v3" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M25 34h14" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M31 28v12" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>`,
      title:{pl:"ListaZakupów",en:"Shopping List"},
      status:{pl:"W rozwoju",en:"In development"},
      description:{pl:"Mobilna aplikacja do tworzenia i synchronizowania list zakupów. Projekt łączy nowoczesny interfejs Compose z kontami użytkowników i chmurą Firebase.",en:"A mobile app for creating and syncing shopping lists. It combines a modern Compose UI with user accounts and Firebase cloud services."},
      features:{pl:["Lista produktów z oznaczaniem kupionych pozycji","Logowanie i osobne dane użytkowników","Synchronizacja przez Firestore","Zakupy pogrupowane według sklepów","Integracja Android + backend Firebase"],en:["Product list with purchased-item tracking","Login and separate user data","Synchronization through Firestore","Shopping grouped by stores","Android + Firebase backend integration"]},
      tags:["Kotlin","Compose","Firebase","Firestore"],
      link:"https://github.com/janczesko12/ListaZakupow"
    },
    {
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 19h28c5.5 0 10 4.5 10 10v9c0 10-8 18-18 18H26C16 56 8 48 8 38v-9c0-5.5 4.5-10 10-10Z" fill="currentColor"/><circle cx="24" cy="34" r="4" fill="#0b0d0a"/><circle cx="40" cy="34" r="4" fill="#0b0d0a"/><path d="M25 44c4 2.5 10 2.5 14 0" fill="none" stroke="#0b0d0a" stroke-width="3.5" stroke-linecap="round"/><path d="M32 19v-7" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="9" r="3" fill="currentColor"/></svg>`,
      title:{pl:"JanBot",en:"JanBot"},
      status:{pl:"Gotowy",en:"Ready"},
      description:{pl:"Modułowy bot Discord z systemem ekonomii, XP, moderacją i bazą danych. Poszczególne funkcje są rozdzielone na cogi, dzięki czemu projekt można łatwo rozwijać.",en:"A modular Discord bot with economy, XP, moderation and a database. Features are split into cogs, making the project easy to extend."},
      features:{pl:["Komendy użytkowe i pomoc","System XP i poziomów","Ekonomia serwera","Moderacja i narzędzia administracyjne","Baza danych SQLite / aiosqlite","Architektura oparta o cogi"],en:["Utility and help commands","XP and leveling system","Server economy","Moderation and admin tools","SQLite / aiosqlite database","Cog-based architecture"]},
      tags:["Python","discord.py","SQLite","Bot"],
      link:"https://github.com/janczesko12/JanBot"
    },
    {
      icon:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="7" y="17" width="50" height="33" rx="7" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="33.5" r="10" fill="none" stroke="currentColor" stroke-width="5"/><path d="M23 17l4-6h10l4 6" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M14 45h36" stroke="currentColor" stroke-width="3" opacity=".65"/></svg>`,
      title:{pl:"Computer Vision / ALPR",en:"Computer Vision / ALPR"},
      status:{pl:"Eksperymentalny",en:"Experimental"},
      description:{pl:"Eksperymenty z rozpoznawaniem tablic rejestracyjnych z wykorzystaniem obrazu z kamery. Projekt łączy OpenCV, OCR i własny serwer Flask.",en:"Experiments with automatic license plate recognition from camera footage. The project combines OpenCV, OCR and a custom Flask server."},
      features:{pl:["Pobieranie obrazu z kamery IP / ESP32-CAM","Przetwarzanie klatek przez OpenCV","Rozpoznawanie tekstu z użyciem OCR","Testy automatycznego odczytu tablic","Własne endpointy serwera Flask"],en:["Image capture from IP camera / ESP32-CAM","Frame processing with OpenCV","Text recognition with OCR","Automatic plate reading tests","Custom Flask server endpoints"]},
      tags:["Python","OpenCV","OCR","Flask"],
      link:"https://github.com/janczesko12/roblox-friends-api"
    },
    {
      icon:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="10" width="44" height="44" rx="4" transform="rotate(14 32 32)" fill="currentColor"/><rect x="25" y="25" width="14" height="14" rx="1.5" transform="rotate(14 32 32)" fill="#0b0d0a"/></svg>`,
      title:{pl:"Roblox Projects",en:"Roblox Projects"},
      status:{pl:"W rozwoju",en:"In development"},
      description:{pl:"Zestaw projektów Roblox Studio obejmujący mechaniki gier, ekonomię, farming, GUI, DataStore i narzędzia budowane z myślą o rozgrywce multiplayer.",en:"A collection of Roblox Studio projects covering game mechanics, economy, farming, GUI, DataStore and multiplayer-focused tools."},
      features:{pl:["Systemy działek i przypisywania gracza","Farming i wzrost upraw","Ekonomia oraz sprzedaż przedmiotów","GUI i RemoteEvents","Zapisywanie postępów przez DataStore","Mechaniki gier tworzonych w Roblox Studio"],en:["Plot and player assignment systems","Farming and crop growth","Economy and item selling","GUI and RemoteEvents","Progress saving with DataStore","Gameplay mechanics built in Roblox Studio"]},
      tags:["Roblox","Lua","Game Dev","DataStore"],
      link:"https://github.com/janczesko12/roblox-game"
    },
    {
      icon:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="8" width="44" height="48" rx="9" fill="none" stroke="currentColor" stroke-width="5"/><path d="M22 23h20M22 32h20M22 41h12" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="45" cy="42" r="5" fill="currentColor"/></svg>`,
      title:{pl:"Wydatki",en:"Expenses"},
      description:{pl:"Aplikacja do zarządzania wydatkami z logowaniem użytkownika i synchronizacją danych przez Firebase Firestore. Projekt powstaje z myślą o wygodnym prowadzeniu finansów na telefonie i współpracy między Androidem a iPhonem.",en:"An expense-management app with user accounts and data synchronization through Firebase Firestore. It is being built for convenient mobile expense tracking and cooperation between Android and iPhone."},
      features:{pl:["Dodawanie i przeglądanie wydatków","Konta użytkowników i osobne dane","Synchronizacja danych przez Firestore","Współpraca wersji Android i iPhone","Eksport i import danych"],en:["Adding and browsing expenses","User accounts and separate data","Data synchronization through Firestore","Android and iPhone versions working together","Data export and import"]},
      tags:["iOS","Swift","Firebase","Firestore"],
      status:{pl:"W rozwoju",en:"In development"},
      link:"https://github.com/janczesko12/Wydatki"
    },
    {
      icon:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 31a20 20 0 0 1 24 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M14 23a29 29 0 0 1 36 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".65"/><circle cx="32" cy="43" r="6" fill="currentColor"/><path d="M32 49v7" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
      title:{pl:"Smart Gaming Setup",en:"Smart Gaming Setup"},
      status:{pl:"Działający",en:"Operational"},
      description:{pl:"Automatyzacje łączące komputer, gry i inteligentne oświetlenie. Skrypty wykrywają uruchomioną aplikację i zmieniają stan oświetlenia zależnie od aktywnego trybu.",en:"Automations connecting the PC, games and smart lighting. Scripts detect the active app and change lighting based on the current mode."},
      features:{pl:["Wykrywanie uruchomionych gier","Automatyczne przełączanie scen LED","Integracja z urządzeniami Tuya / CozyLife","Skrypty PowerShell do automatyzacji","Osobne profile kolorów dla różnych gier"],en:["Detecting running games","Automatic LED scene switching","Tuya / CozyLife device integration","PowerShell automation scripts","Separate color profiles for different games"]},
      tags:["PowerShell","IoT","Tuya","Automation"],
      link:"https://github.com/janczesko12/mythoria"
    }
  ]
};

const translations = {
  pl:{
    navAbout:"O mnie",navProjects:"Projekty",navStack:"Stack",navContact:"Kontakt",
    heroEyebrow:"portfolio / 2026",heroTitle:"Buduję <em>cyfrowe rzeczy</em>, które mają sens.",
    heroLead:"Aplikacje, automatyzacje, projekty AI i małe narzędzia rozwiązujące konkretne problemy.<br>Od pomysłu do działającego produktu.",
    heroProjects:"Zobacz projekty <span>↗</span>",heroContact:"Kontakt",
    heroMetaAi:"integracje i eksperymenty",heroMetaDev:"web • mobile • Python",heroMetaAuto:"skrypty i automatyzacje",
    aboutKicker:"O MNIE",aboutTitle:"Technologia jako narzędzie, nie cel.",
    aboutCopy1:"Lubię brać problem, rozłożyć go na części i zbudować rozwiązanie, które po prostu działa. Interesują mnie szczególnie aplikacje, AI, automatyzacja i projekty, w których software łączy się ze światem fizycznym.",
    aboutCopy2:"W portfolio pokazuję projekty od szybkich eksperymentów po większe aplikacje. Koduję, testuję, poprawiam i uczę się w praktyce — od backendu i baz danych po UI i integracje z urządzeniami.",
    currently:"AKTUALNIE",currentlyTitle:"Buduję. Testuję. Usprawniam.",currentlyAvailability:"otwarty na ciekawe projekty",
    featuredBadge:"⭐ WYRÓŻNIONY PROJEKT",featuredKicker:"NAJWAŻNIEJSZY PROJEKT",featuredTitle:"Roblox — Kradnij Przekąski przed CaseOh",
    featuredDescription:"Multiplayerowa gra Roblox z systemem spawnowania przekąsek, kradzieży, ucieczki i rozgrywki opartej na własnych mechanikach.",
    featuredGithub:"GitHub ↗",featuredMore:"Więcej projektów",
    statProjects:"PROJEKTÓW",statRepos:"REPOZYTORIÓW GITHUB",statFollowers:"OBSERWUJĄCYCH",statIdeas:"POMYSŁÓW",
    projectsKicker:"PROJEKTY",projectsTitle:"Rzeczy, które faktycznie zbudowałem.",
    stackKicker:"STACK",stackTitle:"Narzędzia, których używam.",stackLanguages:"JĘZYKI",stackTools:"NARZĘDZIA I PLATFORMY",stackInterests:"ZAINTERESOWANIA",
    contactKicker:"04 / KONTAKT",contactTitle:"Masz pomysł?<br><em>Napisz.</em>",contactDescription:"Zamiast długiego formularza — konkretnie. Link do GitHuba, e-mail albo wiadomość.",statusLabel:"STATUS",
    email:"E-mail",modalKicker:"SZCZEGÓŁY PROJEKTU",modalFeatures:"CO ZAWIERA",modalTech:"TECHNOLOGIE",modalOpen:"Otwórz projekt",modalBack:"Wróć",
    modalPreparing:"Link w przygotowaniu",easterHint:"* sprawdź easter egg <kbd>↑ ↑ ↓ ↓ ← → ← → B A</kbd>",footerMade:"zrobione z kodu ✦"
  },
  en:{
    navAbout:"About",navProjects:"Projects",navStack:"Stack",navContact:"Contact",
    heroEyebrow:"portfolio / 2026",heroTitle:"I build <em>digital things</em> that make sense.",
    heroLead:"Apps, automations, AI projects and small tools that solve concrete problems.<br>From idea to working product.",
    heroProjects:"See projects <span>↗</span>",heroContact:"Contact",
    heroMetaAi:"integrations and experiments",heroMetaDev:"web • mobile • Python",heroMetaAuto:"scripts and automation",
    aboutKicker:"ABOUT ME",aboutTitle:"Technology as a tool, not a goal.",
    aboutCopy1:"I like taking a problem apart and building a solution that simply works. I am especially interested in apps, AI, automation and projects where software connects with the physical world.",
    aboutCopy2:"This portfolio shows everything from quick experiments to larger applications. I code, test, improve and learn by doing — from backends and databases to UI and device integrations.",
    currently:"CURRENTLY",currentlyTitle:"Building. Testing. Improving.",currentlyAvailability:"open to interesting projects",
    featuredBadge:"⭐ FEATURED PROJECT",featuredKicker:"MAIN PROJECT",featuredTitle:"Roblox — Steal Snacks Before CaseOh",
    featuredDescription:"A multiplayer Roblox game with snack spawning, stealing, escaping and custom gameplay mechanics.",
    featuredGithub:"GitHub ↗",featuredMore:"More projects",
    statProjects:"PROJECTS",statRepos:"GITHUB REPOSITORIES",statFollowers:"FOLLOWERS",statIdeas:"IDEAS",
    projectsKicker:"PROJECTS",projectsTitle:"Things I actually built.",
    stackKicker:"STACK",stackTitle:"Tools I use.",stackLanguages:"LANGUAGES",stackTools:"TOOLS & PLATFORMS",stackInterests:"INTERESTS",
    contactKicker:"04 / CONTACT",contactTitle:"Got an idea?<br><em>Let's talk.</em>",contactDescription:"No long form — just be specific. GitHub link, email or a message.",statusLabel:"STATUS",
    email:"Email",modalKicker:"PROJECT DETAILS",modalFeatures:"INCLUDES",modalTech:"TECHNOLOGIES",modalOpen:"Open project",modalBack:"Back",
    modalPreparing:"Link coming soon",easterHint:"* check the easter egg <kbd>↑ ↑ ↓ ↓ ← → ← → B A</kbd>",footerMade:"made with code ✦"
  }
};

const escapeHtml = (value) => String(value)
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#039;");

const projectsGrid=document.querySelector("#projects-grid");
const projectModal=document.querySelector("#project-modal");
const modalIcon=document.querySelector("#modal-project-icon");
const modalTitle=document.querySelector("#modal-project-title");
const modalDescription=document.querySelector("#modal-project-description");
const modalStatus=document.querySelector("#modal-project-status");
const modalFeatures=document.querySelector("#modal-project-features");
const modalTags=document.querySelector("#modal-project-tags");
const modalProjectLink=document.querySelector("#modal-project-link");
const emailLink=document.querySelector("#email-link");
const githubLink=document.querySelector("#github-link");
const menuToggle=document.querySelector(".menu-toggle");
const nav=document.querySelector("#nav");
const languageToggle=document.querySelector("#language-toggle");
const languageCode=document.querySelector("#language-code");
let currentLanguage=localStorage.getItem("mythoria-language")||"pl";

function renderProjects(){
  projectsGrid.innerHTML=portfolio.projects.map((project,index)=>{
    const title=project.title[currentLanguage];
    const description=project.description[currentLanguage];
    return `
      <article class="project-card reveal" style="animation-delay:${0.05*index}s">
        <div class="project-card-top"><span class="project-index">0${index+1}</span><span class="project-status"><span class="project-status-dot"></span>${escapeHtml(project.status[currentLanguage])}</span></div>
        <div class="project-icon">${project.icon}</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        <div class="project-tags">${project.tags.map(tag=>`<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <button class="project-link" type="button" data-project-index="${index}">${currentLanguage==="pl"?"Opis projektu":"Project details"} ↗</button>
      </article>`;
  }).join("");
}

function applyLanguage(){
  const t=translations[currentLanguage];
  document.documentElement.lang=currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    if(t[el.dataset.i18n]!==undefined) el.innerHTML=t[el.dataset.i18n];
  });
  languageCode.textContent=currentLanguage==="pl"?"EN":"PL";
  languageToggle.setAttribute("aria-label",currentLanguage==="pl"?"Switch to English":"Przełącz na polski");
  renderProjects();
  if(projectModal.classList.contains("open") && projectModal.dataset.projectIndex!==undefined){
    openProjectModal(Number(projectModal.dataset.projectIndex));
  }
}

function openProjectModal(index){
  const project=portfolio.projects[index];
  if(!project) return;
  projectModal.dataset.projectIndex=String(index);
  modalIcon.innerHTML=project.icon;
  modalTitle.textContent=project.title[currentLanguage];
  modalStatus.innerHTML=`<span class="project-status-dot"></span><span>${escapeHtml(translations[currentLanguage].statusLabel)}: ${escapeHtml(project.status[currentLanguage])}</span>`;
  modalDescription.textContent=project.description[currentLanguage];
  modalFeatures.innerHTML=project.features[currentLanguage].map(item=>`<li>${escapeHtml(item)}</li>`).join("");
  modalTags.innerHTML=project.tags.map(tag=>`<span>${escapeHtml(tag)}</span>`).join("");
  if(project.link==="#"){
    modalProjectLink.classList.add("is-disabled");
    modalProjectLink.removeAttribute("href");
    modalProjectLink.innerHTML=translations[currentLanguage].modalPreparing;
  }else{
    modalProjectLink.classList.remove("is-disabled");
    modalProjectLink.href=project.link;
    modalProjectLink.innerHTML=`<span data-i18n="modalOpen">${translations[currentLanguage].modalOpen}</span> <span>↗</span>`;
  }
  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
  document.querySelector(".modal-close").focus();
}

function closeProjectModal(){
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
  delete projectModal.dataset.projectIndex;
}

emailLink.href=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(portfolio.email)}`;
emailLink.target="_blank";
emailLink.rel="noopener noreferrer";
githubLink.href=portfolio.github;
document.querySelector("#year").textContent=new Date().getFullYear();

menuToggle.addEventListener("click",()=>{
  const open=nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
});
nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded","false");
}));

document.addEventListener("click",(event)=>{
  const projectButton=event.target.closest("[data-project-index]");
  if(projectButton) openProjectModal(Number(projectButton.dataset.projectIndex));
  if(event.target.closest("[data-close-modal]")) closeProjectModal();
});
document.addEventListener("keydown",(event)=>{
  if(event.key==="Escape" && projectModal.classList.contains("open")) closeProjectModal();
});

languageToggle.addEventListener("click",()=>{
  currentLanguage=currentLanguage==="pl"?"en":"pl";
  localStorage.setItem("mythoria-language",currentLanguage);
  applyLanguage();
});

fetch("https://api.github.com/users/janczesko12").then(r=>r.json()).then(data=>{
  if(typeof data.public_repos==="number") document.querySelector("#stat-repos").textContent=data.public_repos;
  if(typeof data.followers==="number") document.querySelector("#stat-followers").textContent=data.followers;
}).catch(()=>{});

const konami=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiIndex=0;

function launchEasterEgg(){
  document.body.classList.add("mythoria-easter");

  const oldOverlay=document.querySelector(".easter-overlay");
  if(oldOverlay) oldOverlay.remove();

  const overlay=document.createElement("div");
  overlay.className="easter-overlay";
  overlay.innerHTML=`
    <div class="easter-scanlines"></div>
    <div class="easter-window easter-game-window">
      <div class="easter-window-top">
        <span class="easter-lights"><i></i><i></i><i></i></span>
        <span>mythoria://secret-mode</span>
        <b>ACCESS GRANTED</b>
      </div>
      <div class="snake-header">
        <div>
          <div class="snake-title">MYTHORIA SNAKE</div>
          <small>Wąż odblokowany ✦</small>
        </div>
        <div class="snake-score">SCORE <strong id="snake-score">0</strong></div>
      </div>
      <div class="snake-stage">
        <canvas id="snake-canvas" width="420" height="420" aria-label="Gra Snake"></canvas>
        <div class="snake-message" id="snake-message">
          <strong>START</strong>
          <span>Strzałki / WASD</span>
          <button type="button" id="snake-start" class="snake-btn">GRAJ</button>
        </div>
      </div>
      <div class="snake-controls">
        <span>↑ ↓ ← → / WASD</span>
        <div><button type="button" id="snake-pause" class="snake-btn snake-small">PAUZA</button><button type="button" id="snake-restart" class="snake-btn snake-small">RESET</button></div>
      </div>
    </div>
    <div class="easter-particles" aria-hidden="true"></div>`;

  const particles=overlay.querySelector(".easter-particles");
  for(let i=0;i<28;i++){
    const p=document.createElement("span");
    p.style.left=`${Math.random()*100}%`;
    p.style.animationDelay=`${Math.random()*1.4}s`;
    p.style.animationDuration=`${2.2+Math.random()*2.8}s`;
    p.style.setProperty("--drift",`${(Math.random()-.5)*180}px`);
    particles.appendChild(p);
  }

  document.body.appendChild(overlay);
  setTimeout(()=>overlay.classList.add("visible"),20);

  const canvas=overlay.querySelector("#snake-canvas");
  const ctx=canvas.getContext("2d");
  const scoreEl=overlay.querySelector("#snake-score");
  const message=overlay.querySelector("#snake-message");
  const startBtn=overlay.querySelector("#snake-start");
  const pauseBtn=overlay.querySelector("#snake-pause");
  const restartBtn=overlay.querySelector("#snake-restart");

  const size=21;
  const cell=canvas.width/size;
  let snake=[];
  let food={x:10,y:10};
  let direction={x:1,y:0};
  let nextDirection={x:1,y:0};
  let score=0;
  let running=false;
  let paused=false;
  let gameTimer=null;

  function randomFood(){
    let next;
    do{
      next={x:Math.floor(Math.random()*size),y:Math.floor(Math.random()*size)};
    }while(snake.some(part=>part.x===next.x && part.y===next.y));
    return next;
  }

  function resetGame(showStart=true){
    clearInterval(gameTimer);
    snake=[
      {x:10,y:11},{x:9,y:11},{x:8,y:11},{x:7,y:11}
    ];
    direction={x:1,y:0};
    nextDirection={x:1,y:0};
    score=0;
    scoreEl.textContent="0";
    food=randomFood();
    running=false;
    paused=false;
    pauseBtn.textContent="PAUZA";
    draw();
    if(showStart){
      message.classList.remove("hidden");
      message.querySelector("strong").textContent="START";
      message.querySelector("span").textContent="Strzałki / WASD";
      startBtn.textContent="GRAJ";
    }else{
      message.classList.add("hidden");
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#071008";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="rgba(183,255,74,.055)";
    ctx.lineWidth=1;
    for(let i=0;i<=size;i++){
      const p=i*cell;
      ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,canvas.height);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(canvas.width,p);ctx.stroke();
    }

    ctx.fillStyle="#b7ff4a";
    ctx.shadowColor="#b7ff4a";
    ctx.shadowBlur=18;
    ctx.beginPath();
    ctx.arc((food.x+.5)*cell,(food.y+.5)*cell,cell*.28,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;

    snake.forEach((part,index)=>{
      const pad=index===0?2.5:3.5;
      ctx.fillStyle=index===0?"#d7ff91":"#7fd52f";
      ctx.fillRect(part.x*cell+pad,part.y*cell+pad,cell-pad*2,cell-pad*2);
      if(index===0){
        ctx.fillStyle="#0b0d0a";
        const eye=cell*.13;
        const ox=direction.x===0?cell*.3:(direction.x>0?cell*.63:cell*.25);
        const oy=direction.y===0?cell*.3:(direction.y>0?cell*.63:cell*.25);
        ctx.beginPath();ctx.arc(part.x*cell+ox,part.y*cell+oy,eye,0,Math.PI*2);ctx.fill();
      }
    });
  }

  function gameOver(){
    running=false;
    clearInterval(gameTimer);
    message.classList.remove("hidden");
    message.querySelector("strong").textContent="GAME OVER";
    message.querySelector("span").textContent=`Wynik: ${score}`;
    startBtn.textContent="ZAGRAJ PONOWNIE";
    draw();
  }

  function tick(){
    if(!running || paused) return;
    direction=nextDirection;
    const head={
      x:snake[0].x+direction.x,
      y:snake[0].y+direction.y
    };

    if(head.x<0 || head.x>=size || head.y<0 || head.y>=size ||
       snake.some((part,index)=>index>0 && part.x===head.x && part.y===head.y)){
      gameOver();
      return;
    }

    snake.unshift(head);
    if(head.x===food.x && head.y===food.y){
      score++;
      scoreEl.textContent=String(score);
      food=randomFood();
    }else{
      snake.pop();
    }
    draw();
  }

  function startGame(){
    resetGame(false);
    running=true;
    paused=false;
    message.classList.add("hidden");
    clearInterval(gameTimer);
    gameTimer=setInterval(tick,115);
  }

  function togglePause(){
    if(!running) return;
    paused=!paused;
    pauseBtn.textContent=paused?"WZNÓW":"PAUZA";
    if(paused){
      message.classList.remove("hidden");
      message.querySelector("strong").textContent="PAUZA";
      message.querySelector("span").textContent="Kliknij WZNÓW";
      startBtn.textContent="WZNÓW";
    }else{
      message.classList.add("hidden");
    }
  }

  function setDirection(x,y){
    if(!running || paused) return;
    if(x===-direction.x && y===-direction.y) return;
    if(x===-nextDirection.x && y===-nextDirection.y) return;
    nextDirection={x,y};
  }

  function onSnakeKey(e){
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    const map={
      ArrowUp:{x:0,y:-1},w:{x:0,y:-1},
      ArrowDown:{x:0,y:1},s:{x:0,y:1},
      ArrowLeft:{x:-1,y:0},a:{x:-1,y:0},
      ArrowRight:{x:1,y:0},d:{x:1,y:0}
    };
    if(map[key]){
      e.preventDefault();
      setDirection(map[key].x,map[key].y);
    }
    if(key===" "){
      e.preventDefault();
      togglePause();
    }
  }

  overlay.addEventListener("keydown",onSnakeKey);
  startBtn.addEventListener("click",()=>{
    if(!running || message.querySelector("strong").textContent==="GAME OVER") startGame();
    else togglePause();
    canvas.focus();
  });
  pauseBtn.addEventListener("click",togglePause);
  restartBtn.addEventListener("click",()=>resetGame(true));

  resetGame(true);
  overlay.tabIndex=-1;
  overlay.focus();

  window.clearTimeout(window.mythoriaEasterTimer);
  window.mythoriaEasterTimer=window.setTimeout(()=>{
    clearInterval(gameTimer);
    overlay.classList.remove("visible");
    document.body.classList.remove("mythoria-easter");
    setTimeout(()=>overlay.remove(),400);
  },180000);
}

document.addEventListener("keydown",e=>{
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key===konami[konamiIndex]){
    konamiIndex++;
    if(konamiIndex===konami.length){
      konamiIndex=0;
      launchEasterEgg();
    }
  }else{
    konamiIndex=key===konami[0]?1:0;
  }
});

applyLanguage();

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
