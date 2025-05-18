import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { FirebaseService } from './firebase.service';
import { Location } from '../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private locations: Map<string, Location> = new Map();
  private locationsSubject = new BehaviorSubject<Map<string, Location>>(
    new Map()
  );

  constructor(
    private indexedDB: IndexedDBService,
    private firebaseService: FirebaseService
  ) {
    this.loadLocations();
  }

  // Alapvető helyszíneket adunk hozzá, ha még nincsenek
  private async loadLocations() {
    try {
      // Próbáljuk betölteni Firebase-ből
      const firebaseLocations = await this.firebaseService.getLocations();

      if (firebaseLocations && firebaseLocations.length > 0) {
        firebaseLocations.forEach((location) => {
          this.locations.set(location.id, location);
        });
      } else {
        // Ha nincs Firebase-ben, akkor betöltjük IndexedDB-ből
        const indexedDBLocations = await this.indexedDB.getAllLocations();

        indexedDBLocations.forEach((location) => {
          if (location.id) {
            this.locations.set(location.id.toString(), location);
          }
        });

        // Ha még mindig üres, akkor létrehozunk alapértelmezett helyszíneket
        if (this.locations.size === 0) {
          await this.createDefaultLocations();
        }
      }

      this.locationsSubject.next(this.locations);
    } catch (error) {
      console.error('Error loading locations:', error);

      // Ha hiba történt, létrehozunk alapértelmezett helyszíneket
      if (this.locations.size === 0) {
        await this.createDefaultLocations();
        this.locationsSubject.next(this.locations);
      }
    }
  }

  // Alapértelmezett helyszínek létrehozása
  private async createDefaultLocations() {
    const defaultLocations: Omit<Location, 'id'>[] = [
      {
        name: 'Központi Okmányiroda',
        address: 'Városház utca 9-11.',
        city: 'Budapest',
        postalCode: '1052',
        openingHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '16:00' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
        isActive: true,
      },
      {
        name: 'XIII. kerületi Okmányiroda',
        address: 'Váci út 9-15.',
        city: 'Budapest',
        postalCode: '1139',
        openingHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '16:00' },
          wednesday: { open: '11:00', close: '19:00' },
          thursday: { open: '08:00', close: '16:00' },
          friday: { open: '08:00', close: '14:00' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
        isActive: true,
      },
      {
        name: 'Budai Okmányiroda',
        address: 'Budafoki út 59.',
        city: 'Budapest',
        postalCode: '1111',
        openingHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '16:00' },
          wednesday: { open: '11:00', close: '19:00' },
          thursday: { open: '08:00', close: '16:00' },
          friday: { open: '08:00', close: '14:00' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
        isActive: true,
      },
    ];

    try {
      // Firebase-be mentjük
      for (const location of defaultLocations) {
        const id = await this.firebaseService.addLocation(location);
        this.locations.set(id, { ...location, id });
      }

      // A fő helyszín kulcsa legyen "budapest1" az egyszerűség kedvéért
      if (this.locations.has('0')) {
        const location = this.locations.get('0');
        if (location) {
          this.locations.set('budapest1', location);
        }
      }

      // Szükség esetén IndexedDB-be is elmentjük
      defaultLocations.forEach(async (location, index) => {
        await this.indexedDB.addLocation(location);
      });
    } catch (error) {
      console.error('Error creating default locations:', error);
    }
  }

  // Helyszín név lekérése ID alapján
  getLocationName(id: string): string {
    if (!id) return 'Ismeretlen helyszín';

    // Alapértelmezett helyszín kezelése
    if (id === 'budapest1') {
      return 'Központi Okmányiroda';
    }

    const location = this.locations.get(id);
    if (location) {
      return location.name;
    }

    return `${id} (Ismeretlen helyszín)`;
  }

  // Teljes helyszín lekérése ID alapján
  getLocationById(id: string | number): Observable<Location | null> {
    // Konvertáljuk a string-et számmá, ha szükséges
    const locationId = typeof id === 'string' ? id : id.toString();

    // Ha már megvan, visszaadjuk
    if (this.locations.has(locationId)) {
      return new Observable<Location | null>((observer) => {
        observer.next(this.locations.get(locationId) || null);
        observer.complete();
      });
    }

    // Ha nincs meg, megpróbáljuk lekérni
    return new Observable<Location | null>((observer) => {
      this.firebaseService
        .getLocations()
        .then((locations) => {
          const location = locations.find((l) => l.id === locationId);
          if (location) {
            this.locations.set(locationId, location);
            observer.next(location);
          } else {
            observer.next(null);
          }
          observer.complete();
        })
        .catch((error) => {
          console.error(
            `Error fetching location with ID ${locationId}:`,
            error
          );
          observer.error(error);
        });
    });
  }

  // Összes helyszín lekérése
  getAllLocations(): Observable<Location[]> {
    return new Observable<Location[]>((observer) => {
      if (this.locations.size > 0) {
        observer.next(Array.from(this.locations.values()));
        observer.complete();
        return;
      }

      this.firebaseService
        .getLocations()
        .then((locations) => {
          locations.forEach((location) => {
            this.locations.set(location.id, location);
          });
          observer.next(locations);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching locations:', error);
          this.indexedDB
            .getAllLocations()
            .then((locations) => {
              observer.next(locations);
              observer.complete();
            })
            .catch((error) => {
              observer.error(error);
            });
        });
    });
  }

  // Egyszerű helyszíninformációk lekérése a megjelenítéshez
  getLocationInfo(id: string): { name: string; address: string } {
    const location = this.locations.get(id);

    if (location) {
      return {
        name: location.name,
        address: `${location.postalCode} ${location.city}, ${location.address}`,
      };
    }

    // Alapértelmezett érték, ha nincs meg a helyszín
    if (id === 'budapest1') {
      return {
        name: 'Központi Okmányiroda',
        address: '1052 Budapest, Városház utca 9-11.',
      };
    }

    return {
      name: 'Ismeretlen helyszín',
      address: '',
    };
  }
}
