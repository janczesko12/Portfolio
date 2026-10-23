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
  function appendTextWithLinks(parent, text) {
    const urlPattern = /https?:\/\/[^\s<]+/g;
    let lastIndex = 0;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      let url = match[0];
      let suffix = "";
      while (/[.,!?;:)\]]$/.test(url)) {
        suffix = url.slice(-1) + suffix;
        url = url.slice(0, -1);
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          const link = document.createElement("a");
          link.href = parsed.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = url;
          parent.appendChild(link);
        } else {
          parent.appendChild(document.createTextNode(url));
        }
      } catch {
        parent.appendChild(document.createTextNode(url));
      }
      if (suffix) parent.appendChild(document.createTextNode(suffix));
      lastIndex = urlPattern.lastIndex;
    }
    parent.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  function addMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "ai-chat-message " + role;
    const body = document.createElement("div");
    body.className = "ai-chat-message-body";
    const lines = String(text).split("\n");
    lines.forEach((line, index) => {
      if (index) body.appendChild(document.createElement("br"));
      appendTextWithLinks(body, line);
    });
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
      appendTextWithLinks(firstBody, tr("greeting"));
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
