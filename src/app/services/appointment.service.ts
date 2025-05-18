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
    locationId?: string;
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
        locationId: appointmentData.locationId || 'budapest1', // Használjuk a megadott helyszínt, vagy az alapértelmezettet
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

  /**
   * Időpontfoglalás frissítése
   * @param appointment A frissítendő időpont adatai
   * @returns Promise void
   */
  async updateAppointment(
    appointment: Partial<Appointment> & { id: string | number }
  ): Promise<void> {
    try {
      // Ellenőrizzük, hogy van-e ID
      if (!appointment.id) {
        throw new Error('Appointment ID is required for update');
      }

      // Mentsük el az updatedAt időpontot
      const updatedData = {
        ...appointment,
        updatedAt: new Date(),
      };

      // Ha Firebase ID-val rendelkezik (string típusú)
      if (typeof appointment.id === 'string') {
        // Frissítsük a Firebase-ben
        await this.firebaseService.updateAppointment(
          appointment.id,
          updatedData
        );
      }

      // Frissítsük az IndexedDB-ben is (akkor is, ha string ID, offline támogatáshoz)
      // Ha az ID szám, akkor csak helyi foglalás, nincs Firebase-ben
      try {
        // Ha az ID szám, akkor már van egy helyi másolatunk
        if (typeof appointment.id === 'number') {
          // Lekérjük az eredeti foglalást
          const appointments = await this.indexedDB.getAllAppointments();
          const existingAppointment = appointments.find(
            (a) => a.id === appointment.id
          );

          if (existingAppointment) {
            // Frissítsük a meglévő foglalást a módosított adatokkal
            const updatedAppointment = {
              ...existingAppointment,
              ...updatedData,
            };
            await this.indexedDB.updateAppointment(updatedAppointment);
          }
        }
        // Ha string ID (Firebase), akkor is frissítsük helyben
        else {
          const appointments = await this.indexedDB.getAllAppointments();
          const existingAppointment = appointments.find(
            (a) => a.id === appointment.id
          );

          if (existingAppointment) {
            // Frissítsük a meglévő helyi másolatot
            const updatedAppointment = {
              ...existingAppointment,
              ...updatedData,
            };
            await this.indexedDB.updateAppointment(updatedAppointment);
          } else {
            // Ha nincs helyi másolat, akkor hibát dobunk
            console.warn(
              'Appointment not found in IndexedDB, cannot update locally'
            );
          }
        }
      } catch (error) {
        console.warn('Error updating appointment in IndexedDB:', error);
        // Nem dobunk hibát, ha a lokális frissítés nem sikerül, csak naplózzuk
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  /**
   * Időpontfoglalás státuszának frissítése
   * @param id Az időpont azonosítója
   * @param status Az új státusz
   * @returns Promise void
   */
  async updateAppointmentStatus(
    id: string | number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<void> {
    try {
      // A teljes frissítő metódust hívjuk meg, csak a státuszt frissítve
      await this.updateAppointment({
        // Explicit típuskonverziót végzünk, hogy megfeleljen az Appointment interfésznek
        // Ez biztonságos, mert a rendszer belül helyesen fogja kezelni mind a string,
        // mind a number típusú azonosítókat
        id: id as unknown as string,
        status,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
}
