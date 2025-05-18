import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { FirebaseService } from './firebase.service';
import { UserService } from './user.service';
import { Appointment } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(
    private indexedDB: IndexedDBService,
    private firebaseService: FirebaseService,
    private userService: UserService
  ) {}

  async createAppointment(appointmentData: {
    service: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<string | number> {
    try {
      // Szerezzük meg a bejelentkezett felhasználó azonosítóját
      const currentUser = this.userService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('User not logged in');
      }

      // Készítsük elő az időpont adatait
      const newAppointment: Omit<Appointment, 'id'> = {
        userId: currentUser.id,
        serviceId: appointmentData.service, // Az űrlapból származó service érték
        locationId: 'budapest1', // Alapértelmezett helyszín, később dinamikusan lehet kezelni
        date: appointmentData.date,
        time: appointmentData.time,
        status: 'pending',
        notes: appointmentData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Creating appointment in Firebase:', newAppointment);

      // Mentsük el Firebase-ben
      const appointmentId = await this.firebaseService.addAppointment(
        newAppointment
      );

      // Mentsük el IndexedDB-ben is (offline támogatáshoz)
      await this.indexedDB.addAppointment({
        ...newAppointment,
        id: appointmentId,
      } as Appointment);

      return appointmentId;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAllAppointments(): Promise<Appointment[]> {
    try {
      // Szerezzük meg a bejelentkezett felhasználó azonosítóját
      const currentUser = this.userService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return [];
      }

      // Próbáljuk meg először a Firebase-ből lekérni
      try {
        return await this.firebaseService.getAppointmentsByUser(currentUser.id);
      } catch (error) {
        console.warn(
          'Could not fetch appointments from Firebase, falling back to IndexedDB',
          error
        );
        // Ha nincs internet, használjuk az IndexedDB-t
        return this.indexedDB.getAllAppointments();
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async deleteAppointment(id: string | number): Promise<void> {
    try {
      if (typeof id === 'string') {
        // Ha string (Firebase ID), akkor frissítsük a státuszt cancelled-re
        await this.firebaseService.updateAppointmentStatus(id, 'cancelled');
      }

      // IndexedDB-ből töröljük, ha szám típusú
      if (typeof id === 'number') {
        await this.indexedDB.deleteAppointment(id);
      }
    } catch (error) {
      console.error('Error cancelling/deleting appointment:', error);
      throw error;
    }
  }
}
