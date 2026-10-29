(() => {
  "use strict";

  // Celowo lokalna scenka: brak fetch(), API, logowania, cookies i połączeń z serwerem.
  const startButton = document.getElementById("start-hack");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalState = document.getElementById("terminal-state");
  const progressWrap = document.getElementById("progress-wrap");
  const progressLabel = document.getElementById("progress-label");
  const progressValue = document.getElementById("progress-value");
  const progressBar = document.getElementById("progress-bar");
  const filesSection = document.getElementById("files-section");
  const revealPanel = document.getElementById("reveal-panel");
  const revealFile = document.getElementById("reveal-file");
  const decryptLine = document.getElementById("decrypt-line");
  const prankStamp = document.getElementById("prank-stamp");
  const prankMessage = document.getElementById("prank-message");
  const prankFootnote = document.getElementById("prank-footnote");
  const backFiles = document.getElementById("back-files");
  const closeReveal = document.getElementById("close-reveal");

  const stages = [
    { label: "Uruchamianie fikcyjnego terminala...", log: "[*] Booting NovyDev Cyber Lab...", pct: 12 },
    { label: "Skanowanie przykładowych katalogów...", log: "[*] Checking simulated file index...", pct: 31 },
    { label: "Weryfikacja atrap plików...", log: "[+] Demo file signatures detected.", pct: 52 },
    { label: "Otwieranie sejfu z żartami...", log: "[+] Fake vault unlocked. No real data accessed.", pct: 78 },
    { label: "Przygotowywanie listy plików...", log: "[OK] Simulation complete. Zero network requests.", pct: 100 }
  ];
  let running = false;
  let timers = [];

  function wait(ms) {
    return new Promise(resolve => {
      const id = window.setTimeout(resolve, ms);
      timers.push(id);
    });
  }

  function addLog(text, className) {
    const line = document.createElement("p");
    line.className = "terminal-line" + (className ? " " + className : "");
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "root@novydev:~$ ";
    const message = document.createElement("span");
    message.textContent = text;
    line.append(prompt, message);
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  startButton.addEventListener("click", async () => {
    if (running) return;
    running = true;
    startButton.disabled = true;
    startButton.innerHTML = "<span>⌛</span> URUCHAMIANIE SYMULACJI...";
    terminalState.textContent = "SYMULACJA W TOKU";
    progressWrap.hidden = false;
    addLog("start --simulation-only", "line-warn");

    for (const stage of stages) {
      await wait(520);
      addLog(stage.log, stage.pct === 100 ? "line-ok" : "");
      progressLabel.textContent = stage.label;
      progressValue.textContent = stage.pct + "%";
      progressBar.style.width = stage.pct + "%";
    }

    await wait(350);
    terminalState.textContent = "GOTOWE";
    addLog("Dostępne atrapki plików: 6. Kliknij jedną z nich.", "line-ok");
    filesSection.hidden = false;
    startButton.innerHTML = "✓ SYMULACJA ZAKOŃCZONA";
    filesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function openFile(filename) {
    revealFile.textContent = filename;
    revealPanel.hidden = false;
    decryptLine.hidden = false;
    decryptLine.textContent = "root@novydev:~$ decrypt --open-file " + filename;
    prankStamp.hidden = true;
    prankMessage.hidden = true;
    prankFootnote.hidden = true;
    backFiles.hidden = true;
    revealPanel.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      decryptLine.hidden = true;
      prankStamp.hidden = false;
      prankMessage.hidden = false;
      prankFootnote.hidden = false;
      backFiles.hidden = false;
    }, 620);
  }

  document.getElementById("file-grid").addEventListener("click", event => {
    const card = event.target.closest("[data-file]");
    if (!card) return;
    openFile(card.dataset.file);
  });

  function hideReveal() {
    revealPanel.hidden = true;
    filesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  closeReveal.addEventListener("click", hideReveal);
  backFiles.addEventListener("click", hideReveal);
})();