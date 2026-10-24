(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const unsubscribeId = params.get("id") || "";
  const form = document.getElementById("unsubscribe-form");
  const tokenInput = document.getElementById("unsubscribe-token");
  const status = document.getElementById("unsubscribe-status");
  const submit = document.getElementById("unsubscribe-submit");
  const formContent = document.getElementById("unsub-form-content");
  const success = document.getElementById("unsubscribe-success");

  function showError(message) {
    status.textContent = message;
    status.classList.add("error");
  }

  if (unsubscribeId) {
    // Opaque random ID from the server; the backend resolves it to the subscriber email.
    tokenInput.value = "";
  } else if (token && token.includes(".")) {
    // Backward compatibility for previously delivered emails.
    tokenInput.value = token;
  } else {
    form.querySelectorAll("input, textarea, button").forEach((control) => { control.disabled = true; });
    showError("Brakuje prawidłowego identyfikatora rezygnacji. Otwórz link z najnowszej wiadomości newslettera.");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    const selected = form.querySelector('input[name="reason"]:checked');
    const comment = document.getElementById("unsubscribe-comment").value.trim();
    submit.disabled = true;
    submit.textContent = "Zapisywanie rezygnacji…";
    status.classList.remove("error");
    status.textContent = "";

    try {
      const payload = {
        reason: selected ? selected.value : "",
        comment
      };
      if (unsubscribeId) payload.id = unsubscribeId;
      else payload.token = token;

      const response = await fetch("/api/newsletter-unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Nie udało się zapisać rezygnacji. Spróbuj ponownie.");
      }
      formContent.hidden = true;
      success.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      showError(error.message || "Wystąpił błąd. Spróbuj ponownie.");
      submit.disabled = false;
      submit.innerHTML = 'Potwierdzam rezygnację <span aria-hidden="true">↗</span>';
    }
  });
})();
