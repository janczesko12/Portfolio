(() => {
  const root = document.querySelector("#novydev-ai");
  if (!root) return;

  const toggle = root.querySelector(".ai-chat-toggle");
  const panel = root.querySelector(".ai-chat-panel");
  const closeButton = root.querySelector(".ai-chat-close");
  const form = root.querySelector(".ai-chat-form");
  const input = root.querySelector("#ai-chat-input");
  const sendButton = root.querySelector(".ai-chat-send");
  const messagesEl = root.querySelector(".ai-chat-messages");
  const suggestionsEl = root.querySelector(".ai-chat-suggestions");
  const statusEl = root.querySelector(".ai-chat-status");
  const honeypot = root.querySelector("#ai-chat-company");
  const history = [];
  let busy = false;
  let previousFocus = null;

  const copy = {
    pl: {
      open: "Otwórz czat z AI", close: "Zamknij czat", title: "NovyDev AI",
      online: "Asystent AI · wiele języków", greeting: "Cześć! 👋 Jestem asystentem AI na stronie NovyDev. Zapytaj mnie o programowanie, AI, projekty albo dowolny inny temat. Możesz pisać w swoim języku.",
      placeholder: "Napisz wiadomość…", send: "Wyślij wiadomość", thinking: "Myślę…",
      suggestions: ["Pokaż projekty NovyDev", "Wyjaśnij mi AI", "Pomóż z kodem"],
      failed: "Coś poszło nie tak. Spróbuj ponownie.", limit: "Wiadomość jest za długa (maks. 3000 znaków).",
      hint: "Enter — wyślij · Shift+Enter — nowa linia", newChat: "Nowa rozmowa"
    },
    en: {
      open: "Open AI chat", close: "Close chat", title: "NovyDev AI",
      online: "AI assistant · multilingual", greeting: "Hi! 👋 I'm the AI assistant on the NovyDev website. Ask me about programming, AI, projects, or any other topic. You can write in your own language.",
      placeholder: "Type a message…", send: "Send message", thinking: "Thinking…",
      suggestions: ["Show me NovyDev projects", "Explain AI to me", "Help me with code"],
      failed: "Something went wrong. Please try again.", limit: "Message is too long (max. 3000 characters).",
      hint: "Enter — send · Shift+Enter — new line", newChat: "New conversation"
    }
  };

  function getLanguage() {
    return document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "pl";
  }
  function tr(key) { return copy[getLanguage()][key]; }
  function appendSafeLink(parent, rawUrl, label) {
    let url = String(rawUrl || "");
    let suffix = "";
    while (/[.,!?;:)\]]$/.test(url)) {
      suffix = url.slice(-1) + suffix;
      url = url.slice(0, -1);
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        parent.appendChild(document.createTextNode(url + suffix));
        return;
      }
      const link = document.createElement("a");
      link.href = parsed.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label || url;
      parent.appendChild(link);
      if (suffix) parent.appendChild(document.createTextNode(suffix));
    } catch {
      parent.appendChild(document.createTextNode(url + suffix));
    }
  }

  // Parse a safe subset of Markdown using DOM nodes, never untrusted innerHTML.
  function renderInline(parent, source) {
    const text = String(source);
    const tokens = /\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>]+|\`[^\`\n]+\`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_/g;
    let cursor = 0;
    let match;

    while ((match = tokens.exec(text)) !== null) {
      if (match.index > cursor) parent.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      const token = match[0];

      if (token.startsWith("[") && token.includes("](")) {
        const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (link) appendSafeLink(parent, link[2], link[1]);
        else parent.appendChild(document.createTextNode(token));
      } else if (token.startsWith("http://") || token.startsWith("https://")) {
        appendSafeLink(parent, token, token);
      } else if (token.charAt(0) === String.fromCharCode(96)) {
        const code = document.createElement("code");
        code.className = "ai-chat-inline-code";
        code.textContent = token.slice(1, -1);
        parent.appendChild(code);
      } else if (token.startsWith("**") || token.startsWith("__")) {
        const strong = document.createElement("strong");
        renderInline(strong, token.slice(2, -2));
        parent.appendChild(strong);
      } else {
        const emphasis = document.createElement("em");
        renderInline(emphasis, token.slice(1, -1));
        parent.appendChild(emphasis);
      }
      cursor = tokens.lastIndex;
    }
    if (cursor < text.length) parent.appendChild(document.createTextNode(text.slice(cursor)));
  }

  function isBlockStart(line) {
    return /^\s*(?:\`{3,}|#{1,4}\s+|>\s?|[-*+]\s+|\d+[.)]\s+|(?:---+|___+|\*\*\*+)\s*$)/.test(line);
  }

  function renderMarkdown(parent, source) {
    const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
    let i = 0;
    parent.replaceChildren();

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      if (/^\s*\`{3,}/.test(line)) {
        const opening = line.match(/^\s*(\`{3,})(.*)$/);
        const fenceLength = opening[1].length;
        const language = opening[2].trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9_+-]/g, "").slice(0, 24);
        i++;
        const codeLines = [];
        const closingFence = new RegExp("^\\s*\`{" + fenceLength + ",}\\s*$");
        while (i < lines.length && !closingFence.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
        const pre = document.createElement("pre");
        pre.className = "ai-chat-code-block";
        const code = document.createElement("code");
        if (language) code.dataset.language = language;
        code.textContent = codeLines.join("\n");
        pre.appendChild(code);
        parent.appendChild(pre);
        continue;
      }

      const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const el = document.createElement("h" + Math.min(heading[1].length + 1, 5));
        renderInline(el, heading[2]);
        parent.appendChild(el);
        i++;
        continue;
      }

      if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
        parent.appendChild(document.createElement("hr"));
        i++;
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        const quote = document.createElement("blockquote");
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          if (quote.childNodes.length) quote.appendChild(document.createElement("br"));
          renderInline(quote, lines[i++].replace(/^\s*>\s?/, ""));
        }
        parent.appendChild(quote);
        continue;
      }

      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const unordered = /^\s*[-*+]\s+/.test(line);
      if (ordered || unordered) {
        const list = document.createElement(ordered ? "ol" : "ul");
        const pattern = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
        while (i < lines.length) {
          const item = lines[i].match(pattern);
          if (!item) break;
          const li = document.createElement("li");
          renderInline(li, item[1]);
          list.appendChild(li);
          i++;
        }
        parent.appendChild(list);
        continue;
      }

      const paragraphLines = [line.trim()];
      i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
        paragraphLines.push(lines[i].trim());
        i++;
      }
      const paragraph = document.createElement("p");
      renderInline(paragraph, paragraphLines.join(" "));
      parent.appendChild(paragraph);
    }
  }

  function addMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "ai-chat-message " + role;
    const body = document.createElement("div");
    body.className = "ai-chat-message-body";
    renderMarkdown(body, text);
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function renderSuggestions() {
    suggestionsEl.replaceChildren();
    if (history.length) { suggestionsEl.hidden = true; return; }
    suggestionsEl.hidden = false;
    tr("suggestions").forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ai-chat-suggestion";
      button.textContent = label;
      button.addEventListener("click", () => {
        input.value = label;
        submitMessage();
      });
      suggestionsEl.appendChild(button);
    });
  }

  function translateUi() {
    toggle.setAttribute("aria-label", tr("open"));
    root.querySelector("[data-ai-chat-label]").textContent = getLanguage() === "en" ? "AI Assistant" : "Asystent AI";
    root.querySelector(".ai-chat-new").setAttribute("aria-label", getLanguage() === "en" ? "New conversation" : "Nowa rozmowa");
    root.querySelector(".ai-chat-new").setAttribute("title", getLanguage() === "en" ? "New conversation" : "Nowa rozmowa");
    closeButton.setAttribute("aria-label", tr("close"));
    root.querySelector(".ai-chat-title").textContent = tr("title");
    root.querySelector(".ai-chat-subtitle").textContent = tr("online");
    input.placeholder = tr("placeholder");
    input.setAttribute("aria-label", tr("placeholder"));
    sendButton.setAttribute("aria-label", tr("send"));
    root.querySelector(".ai-chat-hint").textContent = tr("hint");
    statusEl.textContent = "";
    const firstBody = messagesEl.querySelector(".ai-chat-message.assistant .ai-chat-message-body");
    if (history.length === 0 && firstBody) {
      firstBody.replaceChildren();
      renderMarkdown(firstBody, tr("greeting"));
    }
    renderSuggestions();
  }

  function openChat() {
    previousFocus = document.activeElement;
    root.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    if (!messagesEl.children.length) addMessage("assistant", tr("greeting"));
    renderSuggestions();
    input.focus();
  }
  function closeChat() {
    root.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    toggle.focus();
  }

  async function submitMessage() {
    if (busy) return;
    const text = input.value.trim();
    if (!text) return;
    if (text.length > 3000) {
      statusEl.textContent = tr("limit");
      return;
    }
    if (String(honeypot?.value || "").trim()) return;
    busy = true;
    input.value = "";
    input.style.height = "auto";
    addMessage("user", text);
    history.push({ role: "user", content: text });
    const loading = addMessage("assistant", tr("thinking"));
    loading.classList.add("is-thinking");
    statusEl.textContent = tr("thinking");
    sendButton.disabled = true;
    input.disabled = true;
    suggestionsEl.hidden = true;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12), company: String(honeypot?.value || "") })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.reply !== "string") {
        throw new Error(data.error || tr("failed"));
      }
      loading.remove();
      history.push({ role: "assistant", content: data.reply });
      addMessage("assistant", data.reply);
    } catch (error) {
      loading.remove();
      addMessage("assistant", error instanceof Error && error.message ? error.message : tr("failed"));
      history.pop();
    } finally {
      busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      statusEl.textContent = "";
      renderSuggestions();
      input.focus();
    }
  }

  toggle.addEventListener("click", () => root.classList.contains("is-open") ? closeChat() : openChat());
  closeButton.addEventListener("click", closeChat);
  form.addEventListener("submit", event => { event.preventDefault(); submitMessage(); });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitMessage();
    }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });
  root.querySelector(".ai-chat-new").addEventListener("click", () => {
    history.length = 0;
    messagesEl.replaceChildren();
    statusEl.textContent = "";
    addMessage("assistant", tr("greeting"));
    renderSuggestions();
    input.focus();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && root.classList.contains("is-open")) closeChat();
  });
  new MutationObserver(translateUi).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  translateUi();
})();
