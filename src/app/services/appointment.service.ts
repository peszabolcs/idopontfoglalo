import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';

export interface Appointment {
  id?: number;
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private indexedDB: IndexedDBService) {}

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt'>
  ): Promise<number> {
    const newAppointment: Appointment = {
      ...appointment,
      createdAt: new Date(),
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
