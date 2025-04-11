import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { Service } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  constructor(private indexedDB: IndexedDBService) {}

  async getAllServices(): Promise<Service[]> {
    return this.indexedDB.getAllServices();
  }

  async getServiceById(id: number): Promise<Service | null> {
    return this.indexedDB.getServiceById(id);
  }

  async addService(service: Omit<Service, 'id'>): Promise<number> {
    return this.indexedDB.addService(service);
  }

  async updateService(service: Service): Promise<void> {
    return this.indexedDB.updateService(service);
  }

  async deleteService(id: number): Promise<void> {
    return this.indexedDB.deleteService(id);
  }
}
