# Junior DevOps Engineer - Technical Assessment (Demo)

Ten projekt to gotowy szablon zadania rekrutacyjnego:
- prosta aplikacja web,
- requesty do public API,
- CI/CD w GitHub Actions,
- deployment na GitHub Pages.

## 1. Co tutaj jest zrobione

- `index.html` - UI dashboardu.
- `styles.css` - stylowanie.
- `app.js` - logika requestow do API (`/users`, `/posts`) + timeout/retry/cache.
- `.github/workflows/ci-cd-pages.yml` - pipeline CI/CD:
  - walidacja JS i plikow,
  - automatyczny deploy na GitHub Pages po pushu do `main`.

## 2. Dlaczego taki deployment

Wybor: **GitHub Pages + GitHub Actions**.

Powody:
- najprostszy i darmowy hosting dla aplikacji statycznej,
- latwa weryfikacja przez rekrutera (link live),
- deployment idzie automatycznie po merge/push do `main`,
- pipeline zatrzymuje deploy, jesli walidacja nie przejdzie.

Jak to powiedziec na rozmowie:
- "Wybralem rozwiazanie o najnizszym koszcie operacyjnym i szybkim time-to-delivery."
- "Wdrozenie jest powtarzalne i kontrolowane przez pipeline."

## 3. Jak uruchomic lokalnie

Poniewaz to statyczna aplikacja, wystarczy prosty serwer HTTP.

Przyklad (PowerShell):

```powershell
cd c:\Users\musti\OneDrive\Desktop\PRACA
python -m http.server 8080
```

Potem otworz:

`http://localhost:8080`

## 4. Jak wdrozyc na GitHub Pages (krok po kroku)

1. Utworz nowe repo na GitHub.
2. Wrzuc pliki z tego folderu do repo.
3. Upewnij sie, ze domyslna galaz to `main`.
4. Wejdz w `Settings -> Pages`.
5. W `Build and deployment` wybierz `Source: GitHub Actions`.
6. Zrob `git push origin main`.
7. Workflow `CI and Deploy to GitHub Pages` uruchomi sie automatycznie.
8. Po sukcesie dostaniesz link do strony, np.:
   `https://<twoj-login>.github.io/<nazwa-repo>/`

## 5. Jak dzialaja requesty API

Aplikacja pobiera dane z:
- `https://jsonplaceholder.typicode.com/users`
- `https://jsonplaceholder.typicode.com/posts`

Mechanizmy odpornosci:
- timeout requestu (zeby nie wisiec),
- retry (ponowienie po chwilowej awarii),
- cache w `localStorage` (mniej requestow, szybszy UX),
- komunikat bledu dla uzytkownika.

## 6. Typowe problemy i jak je wyjasnic

1. Problem: Deploy nie startuje.
   - Przyczyna: brak ustawionego `Source: GitHub Actions` w Pages.
   - Rozwiazanie: ustaw to w `Settings -> Pages`.

2. Problem: Workflow failuje na walidacji.
   - Przyczyna: blad skladni JS.
   - Rozwiazanie: popraw `app.js`, push ponownie.

3. Problem: API chwilowo nie odpowiada.
   - Rozwiazanie: timeout + retry + czytelny status bledu.

4. Problem: Stare dane po odswiezeniu.
   - Przyczyna: cache.
   - Rozwiazanie: przycisk "Odswiez dane" wymusza pobranie z API.

## 7. Jak obronic projekt na rozmowie

Powiedz krotko:
- "Mialem wymaganie na public API i automatyczny deployment."
- "Dodalem CI, zeby nie wdrazac kodu z bledem."
- "Dodalem timeout/retry/cache, bo siec i API nie sa niezawodne."
- "Wybralem GitHub Pages, bo to minimalny koszt i szybkie dostarczenie."

To pokazuje, ze rozumiesz:
- CI/CD,
- niezawodnosc integracji API,
- swiadome decyzje architektoniczne,
- praktyczne podejscie DevOps.
