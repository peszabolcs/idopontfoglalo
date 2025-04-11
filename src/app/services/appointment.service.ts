import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { Appointment } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private indexedDB: IndexedDBService) {}

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<number> {
    const newAppointment: Appointment = {
      ...appointment,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.indexedDB.addAppointment(newAppointment);
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return this.indexedDB.getAllAppointments();
  }

  async deleteAppointment(id: number): Promise<void> {
    return this.indexedDB.deleteAppointment(id);
  }
}
