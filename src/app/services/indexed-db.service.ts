import { Injectable } from '@angular/core';
import { Appointment } from '../models';
import { User } from '../models';
import { Service } from '../models';
import { Location } from '../models';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'appointmentDB';
  private dbVersion = 1;
  private appointmentStoreName = 'appointments';
  private userStoreName = 'users';
  private serviceStoreName = 'services';
  private locationStoreName = 'locations';
  private db: IDBDatabase | null = null;
  private dbInitialized: Promise<void>;

  constructor() {
    this.dbInitialized = this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject('Database initialization failed');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.appointmentStoreName)) {
          db.createObjectStore(this.appointmentStoreName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains(this.userStoreName)) {
          db.createObjectStore(this.userStoreName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains(this.serviceStoreName)) {
          db.createObjectStore(this.serviceStoreName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains(this.locationStoreName)) {
          db.createObjectStore(this.locationStoreName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
    });
  }

  private async ensureDBInitialized(): Promise<void> {
    await this.dbInitialized;
  }

  // Appointment methods
  async addAppointment(appointment: Appointment): Promise<number> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.appointmentStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.appointmentStoreName);
      const request = store.add(appointment);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllAppointments(): Promise<Appointment[]> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.appointmentStoreName],
        'readonly'
      );
      const store = transaction.objectStore(this.appointmentStoreName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.appointmentStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.appointmentStoreName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // User methods
  async addUser(user: User): Promise<number> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.userStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.userStoreName);
      const request = store.add(user);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllUsers(): Promise<User[]> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([this.userStoreName], 'readonly');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateUser(user: User): Promise<void> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.userStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.userStoreName);
      const request = store.put(user);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getUserById(id: number): Promise<User | null> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([this.userStoreName], 'readonly');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Service methods
  async addService(service: Omit<Service, 'id'>): Promise<number> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.serviceStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.serviceStoreName);
      const request = store.add(service);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllServices(): Promise<Service[]> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.serviceStoreName],
        'readonly'
      );
      const store = transaction.objectStore(this.serviceStoreName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getServiceById(id: number): Promise<Service | null> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.serviceStoreName],
        'readonly'
      );
      const store = transaction.objectStore(this.serviceStoreName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateService(service: Service): Promise<void> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.serviceStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.serviceStoreName);
      const request = store.put(service);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteService(id: number): Promise<void> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.serviceStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.serviceStoreName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Location methods
  async addLocation(location: Omit<Location, 'id'>): Promise<number> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.locationStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.locationStoreName);
      const request = store.add(location);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllLocations(): Promise<Location[]> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.locationStoreName],
        'readonly'
      );
      const store = transaction.objectStore(this.locationStoreName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getLocationById(id: number): Promise<Location | null> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.locationStoreName],
        'readonly'
      );
      const store = transaction.objectStore(this.locationStoreName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateLocation(location: Location): Promise<void> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.locationStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.locationStoreName);
      const request = store.put(location);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteLocation(id: number): Promise<void> {
    await this.ensureDBInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(
        [this.locationStoreName],
        'readwrite'
      );
      const store = transaction.objectStore(this.locationStoreName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
