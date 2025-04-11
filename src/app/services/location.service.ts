import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { Location } from '../models';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private indexedDB: IndexedDBService) {}

  async getAllLocations(): Promise<Location[]> {
    return this.indexedDB.getAllLocations();
  }

  async getLocationById(id: number): Promise<Location | null> {
    return this.indexedDB.getLocationById(id);
  }

  async addLocation(location: Omit<Location, 'id'>): Promise<number> {
    return this.indexedDB.addLocation(location);
  }

  async updateLocation(location: Location): Promise<void> {
    return this.indexedDB.updateLocation(location);
  }

  async deleteLocation(id: number): Promise<void> {
    return this.indexedDB.deleteLocation(id);
  }
}
