const form = document.querySelector("#newsletter-form");
const emailInput = document.querySelector("#newsletter-email");
const consentInput = document.querySelector("#newsletter-consent");
const honeypotInput = document.querySelector("#newsletter-company");
const submitButton = form?.querySelector(".newsletter-submit");
const message = document.querySelector("#newsletter-message");
function showMessage(text, type = "") { if (!message) return; message.textContent = text; message.className = "newsletter-message" + (type ? " " + type : ""); }
form?.addEventListener("submit", async event => {
  event.preventDefault();
  const en = document.documentElement.lang === "en";
  if (String(honeypotInput?.value || "").trim()) { form.reset(); showMessage(en ? "Thanks for your interest!" : "Dziękuję za zainteresowanie.", "success"); return; }
  const email = String(emailInput?.value || "").trim().toLowerCase();
  if (!emailInput?.validity.valid || email.length < 5 || email.length > 254) { showMessage(en ? "Enter a valid email address." : "Wpisz prawidłowy adres e-mail.", "error"); emailInput?.focus(); return; }
  if (!consentInput?.checked) { showMessage(en ? "Please confirm your consent first." : "Najpierw zaznacz zgodę na zapis.", "error"); consentInput?.focus(); return; }
  if (submitButton) submitButton.disabled = true;
  showMessage(en ? "Saving your subscription…" : "Zapisuję adres…");
  try {
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent: consentInput.checked, company: String(honeypotInput?.value || "") }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) throw new Error(response.status === 429 ? (en ? "Please wait a moment and retry." : "Odczekaj chwilę i spróbuj ponownie.") : (en ? "We could not save your subscription. Try again later." : "Nie udało się zapisać do newslettera. Spróbuj później."));
    form.reset(); showMessage(en ? "You are on the list! Thanks for subscribing." : "Gotowe! Adres został zapisany na liście newslettera.", "success");
  } catch (error) {
    console.error("Newsletter signup failed."); showMessage(error instanceof Error ? error.message : (en ? "Something went wrong. Try again." : "Coś poszło nie tak. Spróbuj ponownie."), "error");
  } finally { if (submitButton) submitButton.disabled = false; }
});
