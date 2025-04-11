# Okmányirodai ügyintézés időpontfoglaló oldal

## Projekt Áttekintés

Ez egy modern, Progresszív Webalkalmazás (PWA), ami lehetővé teszi a felhasználóknak, hogy időpontokat foglaljanak online. Az alkalmazás Angular keretrendszeren alapul, ami egy modern, TypeScript-alapú webes fejlesztői platform. Az alkalmazás offline működést is támogat IndexedDB használatával.

## Technológiai Stack

- **Angular**: A fő keretrendszer, ami segít a webalkalmazás struktúrájának és működésének kezelésében
- **TypeScript**: A JavaScript egy típusozott verziója, ami segít a kód minőségének és megbízhatóságának növelésében
- **SCSS**: A CSS egy bővített verziója, ami lehetővé teszi a stílusok hatékonyabb kezelését
- **Angular Router**: Az oldalak közötti navigáció kezelésére
- **Angular Guards**: A biztonságos hozzáférés kezelésére
- **IndexedDB**: Offline adattárolás és kezelés
- **Service Worker**: Offline működés és gyorsítótárazás
- **Material Design**: Modern, reszponzív felhasználói felület
- **RxJS**: Reaktív programozás és adatfolyamok kezelése

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

### 3. Szolgáltatások (`src/app/services/`)

- **IndexedDB Service**: Offline adattárolás kezelése
- **User Service**: Felhasználói műveletek kezelése
- **Appointment Service**: Időpontfoglalások kezelése
- **Service Service**: Szolgáltatások kezelése
- **Location Service**: Helyszínek kezelése

### 4. Védelmek (`src/app/guards/`)

- **Auth Guard**: Ellenőrzi, hogy a felhasználó be van-e jelentkezve
- **Admin Guard**: Ellenőrzi, hogy a felhasználónak van-e admin jogosultsága

### 5. Modellek (`src/app/models/`)

- **User**: Felhasználói adatok modellje
- **Appointment**: Időpontfoglalások modellje
- **Service**: Szolgáltatások modellje
- **Location**: Helyszínek modellje

## Főbb Funkciók

### 1. Offline Működés

- IndexedDB használata adattároláshoz
- Service Worker a gyorsítótárazáshoz
- Offline módban is elérhető alapfunkciók

### 2. Felhasználói Felület

- Material Design komponensek
- Reszponzív, mobile-first dizájn
- Intuitív navigáció
- Form validációk
- Értesítések (Snackbar)

### 3. Biztonság

- Felhasználói autentikáció
- Jogosultságkezelés
- Biztonságos adattárolás

### 4. Adatkezelés

- CRUD műveletek minden entitáshoz
- Reaktív adatfolyamok (RxJS)
- Form kezelés (Reactive Forms)

## Hogyan Működik?

### 1. Routing (Útvonalak)

- Az alkalmazás különböző oldalai között a routing segítségével navigálunk
- Például: `/login` azonosítja a bejelentkezési oldalt
- A védelmek (guards) biztosítják, hogy csak jogosult felhasználók érhetik el bizonyos oldalakat

### 2. Adattárolás

- IndexedDB használata offline adattároláshoz
- Service Worker a gyorsítótárazáshoz
- Adatszinkronizálás online módban

### 3. Komponensek

- Minden komponens egy különálló, újrafelhasználható egység
- Például a header komponens minden oldalon megjelenik
- A komponensek saját HTML, SCSS és TypeScript fájlokkal rendelkeznek

### 4. Stílusok

- SCSS használata modern, reszponzív dizájnhoz
- Material Design komponensek
- Reszponzív elrendezések
- Egyedi stílusok és témák

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

## PWA Telepítés

Az alkalmazás telepíthető PWA-ként:

1. Nyissa meg az alkalmazást a böngészőben
2. Kattintson a telepítés gombra (ha elérhető)
3. Vagy használja a böngésző "Telepítés" opcióját

## Fejlesztői Környezet

- Node.js és npm szükséges
- Angular CLI a fejlesztéshez
- Git a verziókezeléshez
- Visual Studio Code vagy hasonló IDE ajánlott

## Technikai Részletek

### Angular Funkciók

- Komponens alapú architektúra
- Reaktív formok
- Lazy loading
- Custom pipes és direktívák
- Guards és resolvers
- Signal használata

### PWA Funkciók

- Service Worker
- Web App Manifest
- Offline működés
- Gyorsítótárazás
- Telepíthetőség

### Adatbázis

- IndexedDB használata
- CRUD műveletek
- Adatszinkronizálás
- Offline adattárolás

## Gyakori Kérdések

### Mi az Angular?

Angular egy modern webes fejlesztői keretrendszer, ami segít a webalkalmazások létrehozásában. A főbb előnyei:

- Komponens alapú fejlesztés
- Típusbiztos kód (TypeScript)
- Hatékony routing rendszer
- Moduláris felépítés

### Mi a PWA?

Progresszív Webalkalmazás (PWA) egy webalkalmazás, ami:

- Telepíthető
- Offline működik
- Gyors és megbízható
- Reszponzív
- Biztonságos

### Mi az IndexedDB?

IndexedDB egy böngészőben futó adatbázis, ami:

- Nagy mennyiségű adat tárolását teszi lehetővé
- Offline működést támogat
- Gyors adatelérést biztosít
- Strukturált adattárolást tesz lehetővé

### Mi a Service Worker?

A Service Worker egy szkript, ami:

- Offline működést tesz lehetővé
- Gyorsítótárazza az erőforrásokat
- Háttérben fut
- Értesítéseket küldhet
