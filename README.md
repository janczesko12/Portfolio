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
