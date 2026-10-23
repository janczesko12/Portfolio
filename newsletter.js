import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXb7y95RcEi5OkLL4AsQSYBEFYXu3qrvc",
  authDomain: "portfolio-395d6.firebaseapp.com",
  projectId: "portfolio-395d6",
  storageBucket: "portfolio-395d6.firebasestorage.app",
  messagingSenderId: "931360195608",
  appId: "1:931360195608:web:03b2b9b09e09e022cfaf6d",
  measurementId: "G-60PLFSNEFM"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const form = document.querySelector("#newsletter-form");
const emailInput = document.querySelector("#newsletter-email");
const consentInput = document.querySelector("#newsletter-consent");
const submitButton = form?.querySelector(".newsletter-submit");
const message = document.querySelector("#newsletter-message");

function showMessage(text, type = "") {
  if (!message) return;
  message.textContent = text;
  message.className = "newsletter-message" + (type ? " " + type : "");
}

async function hashEmail(email) {
  if (!window.crypto?.subtle) {
    throw new Error("Bezpieczne połączenie HTTPS jest wymagane do zapisania subskrypcji.");
  }
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  const email = String(emailInput?.value || "").trim().toLowerCase();

  if (!emailInput?.validity.valid || email.length < 5 || email.length > 254) {
    showMessage(document.documentElement.lang === "en" ? "Enter a valid email address." : "Wpisz prawidłowy adres e-mail.", "error");
    emailInput?.focus();
    return;
  }
  if (!consentInput?.checked) {
    showMessage(document.documentElement.lang === "en" ? "Please confirm your consent first." : "Najpierw zaznacz zgodę na zapis.", "error");
    consentInput?.focus();
    return;
  }

  if (submitButton) submitButton.disabled = true;
  showMessage(document.documentElement.lang === "en" ? "Saving your subscription…" : "Zapisuję adres…");

  try {
    const subscriberId = await hashEmail(email);
    // A stable, hashed document ID prevents duplicate subscriptions without exposing
    // email addresses in public document paths. Public users cannot read these docs.
    await setDoc(doc(db, "newsletter_subscribers", subscriberId), {
      email,
      consent: true,
      createdAt: serverTimestamp(),
      language: document.documentElement.lang === "en" ? "en" : "pl",
      source: "novydev.pl"
    });

    form.reset();
    showMessage(
      document.documentElement.lang === "en"
        ? "You're on the list! Your email has been saved."
        : "Gotowe! Twój adres został zapisany na liście newslettera.",
      "success"
    );
  } catch (error) {
    console.error("Newsletter signup failed:", error);
    if (error?.code === "permission-denied") {
      showMessage(
        document.documentElement.lang === "en"
          ? "We couldn't save this address. It may already be subscribed, or the newsletter Firestore rules still need to be published."
          : "Nie udało się zapisać adresu. Być może jest już zapisany albo reguły newslettera w Firebase nie zostały jeszcze opublikowane.",
        "error"
      );
    } else {
      showMessage(
        document.documentElement.lang === "en"
          ? "Something went wrong while saving. Please try again in a moment."
          : "Coś poszło nie tak podczas zapisu. Spróbuj ponownie za chwilę.",
        "error"
      );
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
