# Időpontfoglaló Rendszer

## Projekt Áttekintés

Ez egy modern webalkalmazás, ami lehetővé teszi a felhasználóknak, hogy időpontokat foglaljanak online. Az alkalmazás Angular keretrendszeren alapul, ami egy modern, TypeScript-alapú webes fejlesztői platform.

## Technológiai Stack

- **Angular**: A fő keretrendszer, ami segít a webalkalmazás struktúrájának és működésének kezelésében
- **TypeScript**: A JavaScript egy típusozott verziója, ami segít a kód minőségének és megbízhatóságának növelésében
- **SCSS**: A CSS egy bővített verziója, ami lehetővé teszi a stílusok hatékonyabb kezelését
- **Angular Router**: Az oldalak közötti navigáció kezelésére
- **Angular Guards**: A biztonságos hozzáférés kezelésére

## Projekt Struktúra

A projekt a következő főbb részekből áll:

### 1. Komponensek (`src/app/components/`)

- **Header**: Az oldal tetején megjelenő navigációs sáv
- **Footer**: Az oldal alján megjelenő lábléc

### 2. Oldalak (`src/app/pages/`)

- **Home**: A főoldal
- **Login**: Bejelentkezési oldal
- **Register**: Regisztrációs oldal
- **Appointment-booking**: Időpontfoglalási oldal
- **My-appointments**: A felhasználó foglalásainak listázása
- **Admin**: Adminisztrációs felület
- **Not-found**: 404-es hibaoldal

### 3. Védelmek (`src/app/guards/`)

- **Auth Guard**: Ellenőrzi, hogy a felhasználó be van-e jelentkezve
- **Admin Guard**: Ellenőrzi, hogy a felhasználónak van-e admin jogosultsága

## Hogyan Működik?

### 1. Routing (Útvonalak)

- Az alkalmazás különböző oldalai között a routing segítségével navigálunk
- Például: `/login` azonosítja a bejelentkezési oldalt
- A védelmek (guards) biztosítják, hogy csak jogosult felhasználók érhetik el bizonyos oldalakat

### 2. Komponensek

- Minden komponens egy különálló, újrafelhasználható egység
- Például a header komponens minden oldalon megjelenik
- A komponensek saját HTML, SCSS és TypeScript fájlokkal rendelkeznek

### 3. Stílusok

- Az SCSS segítségével modern, reszponzív dizájn
- A stílusok modulárisan vannak szervezve, minden komponens saját stílusokkal rendelkezik

### 4. Biztonság

- A guards védelmet nyújtanak az oldalakhoz
- Csak bejelentkezett felhasználók foglalhatnak időpontot
- Csak admin felhasználók érhetik el az admin felületet

## Hogyan Indítható El?

1. Telepítse a függőségeket:

```bash
npm install
```

2. Indítsa el a fejlesztői szervert:

```bash
ng serve
```

3. Nyissa meg a böngészőben: `http://localhost:4200`

## Gyakori Kérdések

### Mi az Angular?

Angular egy modern webes fejlesztői keretrendszer, ami segít a webalkalmazások létrehozásában. A főbb előnyei:

- Komponens alapú fejlesztés
- Típusbiztos kód (TypeScript)
- Hatékony routing rendszer
- Moduláris felépítés

### Miért TypeScript?

TypeScript a JavaScript egy típusozott verziója, ami:

- Kevesebb hibát eredményez
- Jobb kód minőséget biztosít
- Könnyebb kód karbantarthatóságot tesz lehetővé

### Mi az SCSS?

SCSS a CSS egy bővített verziója, ami:

- Változók használatát teszi lehetővé
- Beágyazott szabályokat támogat
- Könnyebb stílusok kezelését teszi lehetővé

### Mi a Guard?

A Guards olyan biztonsági mechanizmusok, amelyek:

- Ellenőrzik a felhasználó jogosultságait
- Védelmet nyújtanak az oldalakhoz
- Biztosítják a biztonságos hozzáférést

## Fejlesztői Környezet

- Node.js és npm szükséges
- Angular CLI a fejlesztéshez
- Git a verziókezeléshez
