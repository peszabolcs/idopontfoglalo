1. mérföldkő
   2025.03.20.
   Angular projekt legenerálása
   Főbb oldalak létrehozása
   Router felkonfigurálása

2. mérföldkő
   2025.04.10.
   IndexedDB felkonfigurálása
   Legalább 1 kollekció létrehozása
   PWA felkonfigurálása (Service Worker, Web App Manifest,
   HTTP server, telepíthetőség)

# PWA szempontok

## Angular Min. 8 pont

      Funkcionális oldalak 1-3 pont
      Komponensek használata 1-5 pont
      Üzleti logika kiszervezése (service) 1-3 pont
      Saját pipe 0-1 pont
      Saját direktíva 0-1 pont
      Saját guard 0-1 pont
      Routing (lazy loading) 1-2 pont
      Signal használata 0-2 pont
      Külső package használata 0-2 pont

## PWA Min. 8 pont

      Service worker használata 1 pont
      IndexedDB CRUD műveletek 1-5 pont
      Tárak szinkronizálása 0-3 pont
      Web App Manifest 1 pont
      Reszponzív megjelenés 0-3 pont
      Alkalmazásszerűség 0-3 pont

## RxJS Min. 5 pont

      Observable használata 0-3 pont
      Subject használata 0-2 pont
      Async pipe használata 0-2 pont
      Operátorok használata 0-5 pont

## SCSS Min. 4 pont

      Saját mixin 0-3 pont
      Változók használata 0-2 pont
      Beágyazott szelektorok használata 0-1 pont
      További funkciók használata 0-2 pont

## Firebase Min. 5 pont

      Saját kollekciók  0-6 pont
      CRUD műveletek 0-6 pont
      Autentikáció 0-2 pont

## Webkert mérföldkövek

# Fordítási hiba nincs (ng serve kiadásakor nincs hiba) 1 -

# Futtatási hiba nincs (böngésző konzol részében nincs hiba) 1 -

# Adatmodell definiálása (legalább 4 TypeScript interfész vagy class formájában (ugyanennyi kollekció)) 2 0,5 pont/létező interfész vagy osztály, amit az alkalmazás használ is (csak típusként vagy objektumpéldányként használva van)

# Alkalmazás felbontása megfelelő számú komponensre (egyetlen komponens TS és HTML kódja sem haladja meg a 250 sort és soronként a 400 karaktert) 1

# Reszponzív, mobile-first felület (minden adat látható és jól jelenik meg böngészőben is, mobil nézetben is) 2 Böngésző-mobil nézet: 1-1 pont

# Legalább 2 különböző attribútum direktíva használata 2 1 pont/attribútum direktíva

# Legalább 2 különböző beépített vezérlési folyamat használata (if, switch, for) 2 1 pont/vezérlési folyamat, ami valóban használatban is

# Adatátadás szülő és gyermek komponensek között (legalább 1 @Input és 1 @Output) 1 0,5 pont/input, 0,5 pont/output, ha valós adatküldés is megvalósul

# Legalább 10 különböző Material elem helyes használata. 5 0,5 pont/különböző Material elem, amely megjelenik egy oldalon

# Adatbevitel Angular form-ok segítségével megvalósítva (legalább 2) 2 1 pont/form

# Legalább 1 saját Pipe osztály írása és használata 1 -

#Második mérföldkő

Fordítási hiba nincs (ng serve kiadásakor nincs hiba) 0.5
Futtatási hiba nincs (böngésző konzol részében nincs hiba) 0.5
Adatmodell definiálása (legalább 4 TypeScript interfész vagy class formájában (ugyanennyi kollekció)) 2
Reszponzív, mobile-first felület (minden adat látható és jól jelenik meg böngészőben is, mobil nézetben is) 6
Legalább 4, de 2 különböző attribútum direktíva használata 2
Legalább 4, de 2 különböző beépített vezérlési folyamat használata (if, switch, for) 2
Adatátadás szülő és gyermek komponensek között (legalább 3 @Input és 3 @Output) 3
Legalább 10 különböző Material elem helyes használata. 5
Legalább 2 saját Pipe osztály írása és használata 2
Adatbevitel Angular form-ok segítségével megvalósítva (legalább 4) 4
Legalább 2 különböző Lifecycle Hook használata a teljes projektben (értelmes tartalommal, nem üresen) 2
CRUD műveletek mindegyike megvalósult legalább a projekt fő entitásához (Promise, Observable használattal) 4
CRUD műveletek service-ekbe vannak kiszervezve és megfelelő módon injektálva lettek 1
Legalább 4 komplex Firestore lekérdezés megvalósítása (ide tartoznak: where feltétel, rendezés, léptetés, limitálás) 8
Legalább 4 különböző route a különböző oldalak eléréséhez 4
AuthGuard implementációja 1
Legalább 2 route levédése azonosítással (AuthGuard) (ahol ennek értelme van, pl.: egy fórum témakör megtekinthető bárki számára, de a regisztrált felhasználó adatai nem) 1
Szubjektív pontozás a projekt egészére vonatkozólag (mennyire fedi le a projekt a témakört (mennyire kapcsolódik hozzá), mennyi lehet a befektetett energia a projektben) 7

# Hiányzó követelmények a második mérföldkőből

1. Firebase Integráció (0/5 pont)

   - Firebase implementáció hiányzik
   - Hiányzó elemek:
     - Saját kollekciók
     - CRUD műveletek Firebase-szel
     - Autentikáció Firebase-szel

   **Megvalósítási javaslatok:**

   - A meglévő Firebase service már jó kiindulási alap, de implementálni kell a következőket:
     - Appointment kollekció CRUD műveletek befejezése a FirebaseService-ben
     - Felhasználói autentikáció összekapcsolása a UserService-szel
     - A Service és Location entitások teljes CRUD kezelése Firestore-ban
     - Firebase Security Rules beállítása a Firestore számára

2. Komplex Firestore Lekérdezések (0/8 pont)

   - Hiányzó komplex lekérdezések:
     - where feltételek
     - rendezés
     - lapozás
     - limitálás

   **Megvalósítási javaslatok:**

   - FirebaseService bővítése a következő lekérdezésekkel:
     - Időpontok szűrése dátum alapján (where)
     - Időpontok rendezése dátum/idő szerint (orderBy)
     - Lapozás implementálása az adminfelületen (startAfter, limit)
     - Időpontok szűrése státusz szerint (where)
     - Felhasználók szűrése/rendezése (pl. adminok listázása)
     - Szolgáltatások szűrése aktív/inaktív szerint
     - Helyszínek szűrése városok szerint

3. Lifecycle Hook-ok (0/2 pont)

   - Hiányzik legalább 2 különböző lifecycle hook értelmes tartalommal

   **Megvalósítási javaslatok:**

   - AppointmentBookingComponent-ben ngOnInit implementálása a szolgáltatások és helyszínek betöltésére
   - MyAppointmentsComponent-ben ngOnDestroy implementálása a feliratkozások leiratkozására
   - HeaderComponent-ben ngOnChanges implementálása a bejelentkezett felhasználó változásának követésére
   - AdminComponent-ben ngAfterViewInit implementálása az admin nézet inicializálására

4. CRUD Műveletek (Részleges/4 pont)

   - Alap CRUD műveletek implementálva IndexedDB-ben
   - Hiányzó:
     - Időpontfoglalások frissítése
     - Teljes CRUD műveletek a fő entitáshoz (időpontfoglalások)

   **Megvalósítási javaslatok:**

   - AppointmentService kiegészítése updateAppointment metódussal (státusz módosítás, időpont módosítás)
   - FirebaseService és IndexedDBService szinkronizálása
   - Adminfelületen időpontszerkesztés funkció implementálása
   - Felhasználói időpontmódosítás funkció

5. AuthGuard Implementáció (Részleges/1 pont)

   - Alap struktúra létezik, de:
     - Valós autentikációs logika hiányzik (jelenleg mindig true-t ad vissza)
     - Nincs tényleges felhasználói autentikáció ellenőrzés

   **Megvalósítási javaslatok:**

   - UserService integrálása az AuthGuard-ba a tényleges felhasználói bejelentkezés ellenőrzéséhez
   - isLoggedIn metódus implementálása a localStorage ellenőrzésével
   - Hozzáférési token kezelés implementálása

6. Route Védelme (Részleges/1 pont)

   - Útvonalak definiálva AuthGuard-dal
   - De valós autentikációs logika nincs implementálva

   **Megvalósítási javaslatok:**

   - admin route védelme AdminGuard-dal
   - my-appointments route védelme AuthGuard-dal
   - appointment-booking route védelme AuthGuard-dal
   - Felhasználói profil útvonal létrehozása és védelme

7. Reszponzív Dizájn (Részleges/6 pont)

   - Néhány reszponzív dizájn elem megtalálható
   - De szükséges átfogóbb mobile-first implementáció

   **Megvalósítási javaslatok:**

   - Header komponens mobilnézetre optimalizálása (hamburger menü)
   - Időpontfoglaló űrlap reszponzív átalakítása (oszlopok elrendezése)
   - Az időpontlista nézet optimalizálása mobil eszközökre
   - Media query-k implementálása a fő komponensekben
   - Flex/Grid layout rendszeres használata

8. Saját Pipe-ok (0/2 pont)

   - Hiányzik legalább 2 saját pipe implementáció

   **Megvalósítási javaslatok:**

   - Már van egy DateFormatPipe, ezt kell kiegészíteni:
     - StatusTranslatePipe: Az időpontfoglalás státuszának magyar fordítását adja (pending → függőben, confirmed → megerősítve, stb.)
     - TimeFormatPipe: Időformázás, pl. 14:30 → du. 2:30
     - ShortTextPipe: Hosszabb szövegek rövidítése (pl. jegyzet mezőben)
     - PhoneNumberFormatPipe: Telefonszámok formázása megfelelő formátumra

9. Form Implementáció (Részleges/4 pont)

   - Alap form struktúra létezik
   - De szükséges átfogóbb form implementációk (legalább 4)

   **Megvalósítási javaslatok:**

   - A meglévő login/register/appointment-booking formok mellé:
     - Felhasználói profil szerkesztő űrlap implementálása
     - Időpontmódosítás űrlap
     - Admin oldal szolgáltatás kezelő űrlap
     - Admin oldal helyszín kezelő űrlap
     - Kapcsolatfelvételi űrlap

10. Input/Output Dekorátorok (Részleges/3 pont)

    - Több @Input és @Output dekorátor implementációja szükséges (legalább 3-3)

    **Megvalósítási javaslatok:**

    - AppointmentListComponent már tartalmaz néhány @Input/@Output dekorátort, ezeket kiegészíteni:
      - Új AppointmentCardComponent létrehozása, ami @Input-ként kap egy appointment objektumot
      - LocationSelectorComponent létrehozása @Input location listával és @Output locationSelected eseménnyel
      - ServiceSelectorComponent létrehozása @Input service listával és @Output serviceSelected eseménnyel
      - DateTimeSelectorComponent létrehozása @Input foglalt időpontokkal és @Output dateTimeSelected eseménnyel
      - A szülő komponensek és ezek összekapcsolása

11. Material Elemek (Részleges/5 pont)

    - Néhány Material elem használva van
    - De több változatosság szükséges (legalább 10 különböző elem)

    **Megvalósítási javaslatok:**

    - A meglévő Material elemek mellett (MatCard, MatFormField, MatButton) újak bevezetése:
      - MatDialog: Időpont törlés megerősítés ablak
      - MatStepper: Időpontfoglalás lépésekre bontva
      - MatTable: Admin időpontlista megjelenítés
      - MatPaginator: Admin időpontlista lapozás
      - MatSort: Admin időpontlista rendezés
      - MatExpansionPanel: Gyakori kérdések szakasz
      - MatSlideToggle: Beállítások kapcsolók
      - MatToolbar: Admin felület eszköztár
      - MatAutocomplete: Helyszín keresés
      - MatBottomSheet: Mobil nézet funkciók

12. Vezérlési Folyamatok (Részleges/2 pont)

    - Néhány vezérlési folyamat használva van
    - De több változatosság szükséges (legalább 4 különböző típus)

    **Megvalósítási javaslatok:**

    - \*ngIf: Feltételes megjelenítés (több kontextusban)
    - \*ngFor: Listák iterálása (már használva van)
    - \*ngSwitch: Időpont státusz kezelése (pending, confirmed, cancelled, completed)
    - async pipe: Firebase Observable-ök megjelenítése

13. Attribútum Direktívák (Részleges/2 pont)

    - Több attribútum direktíva implementációja szükséges (legalább 4 különböző)

    **Megvalósítási javaslatok:**

    - [ngClass]: Dinamikus osztályok hozzáadása (már használatban)
    - [ngStyle]: Dinamikus stílusok (pl. időpont státusz színezése)
    - [routerLink]: Navigáció "már használatban"
    - Saját HighlightDirective: Egérrel való rámutatáskor kiemelés
    - Saját TimeValidatorDirective: Időpont validálása (csak munkaidőben)
    - Saját StatusColorDirective: Különböző színezés a státusz alapján
