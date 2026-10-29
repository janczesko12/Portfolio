(() => {
  "use strict";

  // Lokalna scenka-żart. Nie odczytuje ani nie wysyła haseł, cookies ani danych urządzenia.
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

  let step = "login";
  let loggedInAs = "";

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
    input.focus();
  }

  function normalizedPassword(value) {
    return value.toLowerCase()
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/\s+/g, "");
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
      print("Hasło: " + value);
      if (!["admin-hacked", "adminhacked"].includes(normalizedPassword(value))) {
        print("BŁĄD: Nieprawidłowe hasło. Spróbuj ponownie.", "warning");
        setPrompt("Hasło:");
        return;
      }
      showDirectory();
      return;
    }

    if (!value) {
      setPrompt("C:\\Users\\" + loggedInAs + "\\vault>");
      return;
    }

    const command = value.toLowerCase();
    print("C:\\Users\\" + loggedInAs + "\\vault>" + " " + value);

    if (command === "dir" || command === "ls") {
      showDirectory();
      return;
    }
    if (command === "help") {
      print("Dostępne polecenia: DIR, HELP, EXIT oraz nazwa jednego z plików TXT.");
      print("");
    } else if (command === "exit") {
      terminal.replaceChildren();
      print("Microsoft Windows [Version 10.0.19045.4046]");
      print("(c) Microsoft Corporation. Wszelkie prawa zastrzeżone.");
      print("");
      print("Sesja zakończona. Odśwież stronę, aby uruchomić scenkę ponownie.");
      form.hidden = true;
      return;
    } else {
      const fileName = files.find(file => file.toLowerCase() === command || file.toLowerCase() === command.replace(/^type\s+/, ""));
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

  print("Microsoft Windows [Version 10.0.19045.4046]");
  print("(c) Microsoft Corporation. Wszelkie prawa zastrzeżone.");
  print("");
  print("NOVYDEV SECURE CONSOLE");
  print("Uwaga: to tylko symulacja terminala, nie prawdziwe logowanie.");
  print("");
  print("Podaj dane dostępu do demonstracyjnego sejfu.");
  print("");

  form.addEventListener("submit", event => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    handleCommand(value);
  });

  terminal.addEventListener("click", () => input.focus());
})();