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
