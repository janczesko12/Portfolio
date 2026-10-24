# Mythoria — portfolio

Gotowe, statyczne portfolio bez frameworków i bez bazy danych.

## Pliki
- `index.html` — struktura strony
- `style.css` — wygląd, responsywność i animacje
- `script.js` — projekty, linki kontaktowe i menu mobilne
- `favicon.svg` — ikona strony

## Najważniejsze rzeczy do zmiany
Otwórz `script.js` i zmień na początku:

```js
email: "twoj-email@example.com",
github: "https://github.com/",
```

Potem w tablicy `projects` zmień linki `link: "#"` na linki do repozytoriów/demo.

W `index.html` możesz też zmienić:
- tekst w hero,
- opis w sekcji „O mnie”,
- tytuł strony i meta description.

## Uruchomienie lokalne
Najprościej otworzyć `index.html` w przeglądarce.

Możesz też uruchomić serwer:

```bash
python -m http.server 8080
```

i wejść na `http://localhost:8080`.


## Katalog aplikacji i panel administratora

- `aplikacje.html` — publiczny katalog opublikowanych aplikacji.
- `applications.js` i `applications.css` — pobieranie oraz wyświetlanie katalogu.
- `admin-aplikacje.html` — prywatny panel zarządzania aplikacjami.
- `admin-aplikacje.js` — logowanie Google, dodawanie, edycja, sortowanie, ukrywanie i usuwanie wpisów.
- `firestore.rules` — reguły ograniczające zapis do zweryfikowanego konta administratora.

### Wymagana konfiguracja Firebase (jednorazowo)

1. W Firebase Console otwórz **Authentication → Sign-in method** i włącz dostawcę **Google**.
2. W **Authentication → Settings → Authorized domains** upewnij się, że jest dodana domena `novydev.pl` (oraz `www.novydev.pl`, jeśli korzystasz z niej).
3. Otwórz **Firestore Database → Rules**, wklej zawartość pliku `firestore.rules` z tego repozytorium i kliknij **Publish**.
4. Zaloguj się w panelu pod adresem `/admin-aplikacje.html` na zweryfikowane konto Google `janczesko12@gmail.com`.

Reguły Firestore egzekwują uprawnienia po stronie serwera. Samo ukrycie panelu w interfejsie nie jest zabezpieczeniem. Użytkownicy publiczni mogą czytać wyłącznie wpisy z `published: true`; tylko wskazany, zweryfikowany administrator może dodawać, edytować i usuwać wpisy.

### Dodawanie aplikacji

W panelu wpisz nazwę, opis, platformę, wersję, kolejność sortowania, URL ikony/obrazka, link pobierania i opcjonalny link strony. Zaznaczenie **Opublikowana publicznie** decyduje, czy aplikacja pojawi się w publicznym katalogu. Obrazki są obecnie podawane przez URL; pliki nie są przesyłane do Firebase Storage.

## Newsletter

The homepage newsletter form sends explicit signups to the Vercel serverless endpoint `/api/newsletter`. The endpoint uses the server-only `RESEND_API_KEY` environment variable to add the contact to Resend, the `General` segment, and the `NovyDev Newsletter` topic. The API key must never be included in browser-side files.

In Vercel, configure `RESEND_API_KEY` for the **Production** environment and redeploy after changing it. The Resend sending domain `novydev.pl` should remain verified. The form includes email validation, an unchecked consent checkbox, a honeypot field, same-site origin checks, and best-effort request throttling.

Open the private dashboard at `/admin-newsletter` after deployment. It uses Google sign-in and the same verified administrator account as the existing app-management panel.

### Private newsletter administration API

- `GET /api/newsletter-admin` lists eligible subscribers. It requires a Firebase Authentication ID token in `Authorization: Bearer <token>`. Only the verified administrator account `janczesko12@gmail.com` is accepted.
- `POST /api/newsletter-admin` sends a newsletter only to consented subscribers. It requires JSON `{ "subject": "...", "message": "...", "confirmSend": true }` and the same administrator token. Deployment itself never sends a campaign.
- `GET /api/newsletter-unsubscribe?token=...` displays a confirmation page; confirming it marks the Firestore record as unsubscribed.
- `api/newsletter.js` mirrors new signups into `newsletter_subscribers` when Firebase service-account configuration is present. Earlier signups are not backfilled automatically.

Set these Vercel **Production** environment variables and redeploy:
- `FIREBASE_SERVICE_ACCOUNT_JSON` — the JSON contents of a Firebase service-account key for project `portfolio-395d6`. Keep this secret and never commit it.
- `NEWSLETTER_UNSUBSCRIBE_SECRET` — a long, random secret used to sign unsubscribe tokens.
- `RESEND_API_KEY` — the existing Resend sending key.
- Optional: `NEWSLETTER_FROM` — defaults to `NovyDev <newsletter@novydev.pl>`; the sender domain must be verified in Resend.

Create the service-account key in Firebase Console → Project settings → Service accounts. Do not paste the private key into chat or source control. Grant the service account only the permissions needed for Firestore access.

## AI assistant on the portfolio

The floating multilingual chat uses Google Gemini through the server-side `/api/chat` function. Set `GEMINI_API_KEY` in Vercel's **Production** environment. Optionally set `GEMINI_CHAT_MODEL` to override the default `gemini-3.8-flash` model. The endpoint uses Google Search grounding for current information when available. Do not place provider secrets in browser files. Recent conversation context is kept in browser memory for that tab. API usage is subject to the limits and billing settings of the Google AI account.
