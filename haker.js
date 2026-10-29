(() => {
  "use strict";

  // Lokalna scenka-żart. Teksty SSH/backdoor są wyłącznie animacją:
  // nie ma połączeń sieciowych, prawdziwego SSH ani dostępu do żadnych danych.
  const terminal = document.getElementById("terminal");
  const form = document.getElementById("entry-line");
  const prompt = document.getElementById("prompt");
  const input = document.getElementById("command");

  const files = [
    "api_keys.txt",
    "logins.txt",
    "passwords.txt",
    "mObywatel_logins.txt",
    "cookies.txt",
    "database_dump.txt"
  ];

  let step = "boot";
  let loggedInAs = "";

  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  function print(text = "", className = "") {
    const line = document.createElement("div");
    if (className) line.className = className;
    line.textContent = text;
    terminal.appendChild(line);
    window.scrollTo(0, document.body.scrollHeight);
  }

  function setPrompt(text) {
    prompt.textContent = text;
    input.value = "";
    input.disabled = false;
    input.focus();
  }

  function normalizedPassword(value) {
    return value.toLowerCase()
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/\s+/g, "");
  }

  async function loadingSequence() {
    input.disabled = true;
    prompt.textContent = "boot@novydev:~$";
    print("NOVYDEV REMOTE ACCESS CONSOLE");
    print("UWAGA: Nieoficjalna symulacja terminala. Nie łączy się z siecią ani nie czyta danych.");
    print("");
    await sleep(350);
    print("[INIT] Starting remote access subsystem...");
    await sleep(420);
    print("[ OK ] Loading network interface ................. done", "success");
    await sleep(350);
    print("[ OK ] Resolving gateway 192.168.1.1 .............. done", "success");
    await sleep(400);
    print("[SSH ] ssh admin@192.168.1.77 -p 22");
    await sleep(450);
    print("[SSH ] Connecting to 192.168.1.77:22 ...");
    for (const pct of [18, 34, 51, 73, 92, 100]) {
      await sleep(160);
      const filled = Math.round(pct / 10);
      print("       [" + "#".repeat(filled) + ".".repeat(10 - filled) + "] " + pct + "%");
    }
    await sleep(300);
    print("[WARN] SSH key rejected. Trying alternate route...", "warning");
    await sleep(420);
    print("[SCAN] Searching simulated service paths...");
    await sleep(450);
    print("[FOUND] BACKDOOR endpoint detected: /dev/.system-cache", "success");
    await sleep(370);
    print("[AUTH] Attempting simulated BACKDOOR entry...");
    for (const pct of [25, 50, 75, 100]) {
      await sleep(210);
      print("       Backdoor handshake [" + "#".repeat(pct / 25) + " " .repeat(4 - pct / 25) + "] " + pct + "%");
    }
    await sleep(350);
    print("[ OK ] BACKDOOR ENTRY GRANTED [SIMULATED]", "success");
    await sleep(320);
    print("[LOAD] Mounting sample credential vault...");
    await sleep(420);
    print("[ OK ] Vault mounted: /secure/dump/", "success");
    print("[INFO] All network actions above were simulated locally.", "warning");
    print("");
    print("Wymagane uwierzytelnienie administratora:");
    print("");
    step = "login";
    setPrompt("Login:");
  }

  async function runFakeDataCollection() {
    step = "loading";
    input.disabled = true;
    prompt.textContent = "admin@novydev:~$";
    print("");
    print("[AUTH] Credentials accepted. Starting post-login checks...", "success");
    const stages = [
      ["[CHECK] Checking simulated account permissions...", 450],
      ["[SCAN ] Enumerating directories...", 520],
      ["[SCAN ] Checking sample configuration files...", 520],
      ["[DATA ] Preparing sample API-key records...", 600],
      ["[DATA ] Preparing sample login/password records...", 620],
      ["[DATA ] Preparing sample cookie/session records...", 580],
      ["[DATA ] Preparing sample database index...", 620],
      ["[PACK ] Packing prepared records into vault...", 650],
      ["[VERIFY] Verifying manifest and checksums...", 550],
      ["[DONE ] 6 sample text files prepared. No real data accessed.", 450]
    ];
    for (let i = 0; i < stages.length; i++) {
      await sleep(stages[i][1]);
      const pct = Math.round(((i + 1) / stages.length) * 100);
      print(stages[i][0], i === stages.length - 1 ? "success" : "");
      const bars = Math.round(pct / 10);
      print("         [" + "#".repeat(bars) + ".".repeat(10 - bars) + "] " + pct + "%");
    }
    print("");
    print("[INFO] To wyłącznie animacja — nie czyta plików urządzenia.", "warning");
    print("[INFO] Nie pobiera cookies ani danych kont i niczego nie wysyła.", "warning");
    await sleep(350);
    showDirectory();
  }

  function showDirectory() {
    step = "command";
    print("");
    print("Access granted.", "success");
    print("Łączenie z C:\\Users\\" + loggedInAs + "\\vault ...");
    print("Połączenie: OK (SYMULACJA)");
    print("");
    print(" Directory of C:\\Users\\" + loggedInAs + "\\vault");
    print("");
    print("10/29/2026  09:14 PM    <DIR>          .");
    print("10/29/2026  09:14 PM    <DIR>          ..");
    for (const file of files) {
      print("10/29/2026  09:14 PM             " + String(2048 + file.length * 137).padStart(5, " ") + " " + file);
    }
    print("               6 File(s)         12,844 bytes");
    print("");
    print("Wpisz nazwę pliku, aby go otworzyć. Możesz też wpisać DIR, HELP lub EXIT.");
    setPrompt("C:\\Users\\" + loggedInAs + "\\vault>");
  }

  function openFakeFile(filename) {
    print("C:\\Users\\" + loggedInAs + "\\vault> type " + filename);
    print("Otwieranie pliku: " + filename + " ...");
    print("");
    print("============================================================", "warning");
    print("                    SYMULOWANA ZAWARTOŚĆ", "warning");
    print("============================================================", "warning");
    print("");
    print("  X X   X X   DDDD");
    print("   X     X    D   D");
    print("  X X   X X   D   D");
    print("   X     X    D   D");
    print("  X X   X X   DDDD");
    print("");
    print("  D A Ł E Ś   S I Ę   N A B R A Ć   X D D", "prank");
    print("");
    print("To tylko żart :) Nie pobrano żadnych prawdziwych kluczy API, haseł,");
    print("loginów, ciasteczek ani danych mObywatela.");
    print("Wszystkie pliki są atrapami wygenerowanymi w przeglądarce.");
    print("");
    setPrompt("C:\\Users\\" + loggedInAs + "\\vault>");
    step = "command";
  }

  function handleCommand(rawValue) {
    const value = rawValue.trim();
    if (step === "login") {
      if (value.toLowerCase() !== "admin") {
        print("Login: " + value);
        print("Nieprawidłowy login. Spróbuj ponownie.", "warning");
        setPrompt("Login:");
        return;
      }
      loggedInAs = "admin";
      print("Login: " + value);
      step = "password";
      setPrompt("Hasło:");
      return;
    }

    if (step === "password") {
      // Nie pokazujemy ani nie zapisujemy wpisanego hasła w terminalu.
      print("Hasło: ********");
      if (!["admin-hacked", "adminhacked"].includes(normalizedPassword(value))) {
        print("BŁĄD: Nieprawidłowe hasło. Spróbuj ponownie.", "warning");
        setPrompt("Hasło:");
        return;
      }
      runFakeDataCollection();
      return;
    }

    if (!value) {
      setPrompt("C:\\Users\\" + loggedInAs + "\\vault>");
      return;
    }

    const command = value.toLowerCase();
    print("C:\\Users\\" + loggedInAs + "\\vault> " + value);

    if (command === "dir" || command === "ls") {
      showDirectory();
      return;
    }
    if (command === "help") {
      print("Dostępne polecenia: DIR, HELP, EXIT oraz nazwa jednego z plików TXT.");
      print("");
    } else if (command === "exit") {
      terminal.replaceChildren();
      print("NOVYDEV SYSTEM CONSOLE");
      print("");
      print("Sesja zakończona. Odśwież stronę, aby uruchomić scenkę ponownie.");
      form.hidden = true;
      return;
    } else {
      const fileName = files.find(file => file.toLowerCase() === command || file.toLowerCase() === command.replace(/^type\\s+/, ""));
      if (fileName) {
        openFakeFile(fileName);
        return;
      }
      const number = Number(command);
      if (Number.isInteger(number) && number >= 1 && number <= files.length) {
        openFakeFile(files[number - 1]);
        return;
      }
      print("'" + value + "' is not recognized as an internal or external command.", "warning");
      print("Wpisz HELP, aby zobaczyć polecenia.");
      print("");
    }
    setPrompt("C:\\Users\\" + loggedInAs + "\\vault>");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (input.disabled || step === "boot") return;
    const value = input.value;
    input.value = "";
    handleCommand(value);
  });

  terminal.addEventListener("click", () => {
    if (!input.disabled) input.focus();
  });

  loadingSequence();
})();