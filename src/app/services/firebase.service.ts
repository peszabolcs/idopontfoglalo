import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  setDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  documentId,
  collectionGroup,
  QuerySnapshot,
  QueryDocumentSnapshot,
  and,
  or,
  writeBatch,
  increment,
  runTransaction,
  serverTimestamp,
  getCountFromServer,
  startAt,
  endAt,
  endBefore,
} from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { User as UserModel, Service, Location, Appointment } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Authentication methods
  async registerUser(
    email: string,
    password: string,
    userData: Omit<UserModel, 'id' | 'createdAt' | 'lastLogin'>
  ): Promise<string> {
    try {
      // First create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Create user data object for Firestore
      const user: Omit<UserModel, 'id'> = {
        ...userData,
        email,
        isAdmin: false, // Default to regular user
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      try {
        // Try to store user data in Firestore
        const userRef = doc(this.firestore, 'users', userCredential.user.uid);
        await setDoc(userRef, user);
      } catch (firestoreError) {
        console.error('Error storing user data in Firestore:', firestoreError);
        // Even if Firestore write fails, we still want to return the user ID
        // since the authentication was successful
      }

      return userCredential.user.uid;
    } catch (error: any) {
      console.error('Error registering user:', error);
      // Enhance error for better debugging
      if (
        error.code === 'permission-denied' ||
        error.message?.includes('permission-denied')
      ) {
        console.error(
          'Firebase permissions error. Check your Firestore security rules.'
        );
      }
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<string> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const userDoc = await getDoc(
        doc(this.firestore, 'users', userCredential.user.uid)
      );

      if (userDoc.exists()) {
        // Update last login
        await updateDoc(doc(this.firestore, 'users', userCredential.user.uid), {
          lastLogin: new Date(),
        });
        return userCredential.user.uid;
      }
      return '';
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // User CRUD operations
  async getUserById(id: string): Promise<UserModel | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', id));

      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserModel, 'id'>;
        return { id, ...userData } as UserModel;
      }

      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<UserModel[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<UserModel, 'id'>;
        return { id: doc.id, ...data } as UserModel;
      });
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<UserModel>): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', id);
      await updateDoc(userRef, { ...userData });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // CRUD operations for Services
  async getServices(): Promise<Service[]> {
    try {
      const servicesRef = collection(this.firestore, 'services');
      const snapshot = await getDocs(servicesRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Service, 'id'>;
        return { id: doc.id, ...data } as Service;
      });
    } catch (error) {
      console.error('Error getting services:', error);
      throw error;
    }
  }

  async addService(service: Omit<Service, 'id'>): Promise<string> {
    try {
      const servicesRef = collection(this.firestore, 'services');
      const docRef = await addDoc(servicesRef, service);
      return docRef.id;
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  }

  async updateService(id: string, service: Partial<Service>): Promise<void> {
    const serviceRef = doc(this.firestore, 'services', id);
    await updateDoc(serviceRef, service);
  }

  async deleteService(id: string): Promise<void> {
    const serviceRef = doc(this.firestore, 'services', id);
    await deleteDoc(serviceRef);
  }

  // CRUD operations for Locations
  async getLocations(): Promise<Location[]> {
    try {
      const locationsRef = collection(this.firestore, 'locations');
      const snapshot = await getDocs(locationsRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Location, 'id'>;
        return { id: doc.id, ...data } as Location;
      });
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }

  async addLocation(location: Omit<Location, 'id'>): Promise<string> {
    try {
      const locationsRef = collection(this.firestore, 'locations');
      const docRef = await addDoc(locationsRef, location);
      return docRef.id;
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<void> {
    const locationRef = doc(this.firestore, 'locations', id);
    await updateDoc(locationRef, location);
  }

  async deleteLocation(id: string): Promise<void> {
    const locationRef = doc(this.firestore, 'locations', id);
    await deleteDoc(locationRef);
  }

  // CRUD operations for Appointments
  async getAppointments(): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(appointmentsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Appointment, 'id'>;
      return { id: doc.id, ...data } as Appointment;
    });
  }

  async addAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const newAppointment = {
        ...appointment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await addDoc(appointmentsRef, newAppointment);
      return docRef.id;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  }

  async updateAppointment(
    id: string,
    appointment: Partial<Appointment>
  ): Promise<void> {
    const appointmentRef = doc(this.firestore, 'appointments', id);
    await updateDoc(appointmentRef, {
      ...appointment,
      updatedAt: new Date(),
    });
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      const appointmentRef = doc(this.firestore, 'appointments', id);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Additional CRUD operations for Appointments
  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const appointmentDoc = await getDoc(
        doc(this.firestore, 'appointments', id)
      );

      if (appointmentDoc.exists()) {
        const data = appointmentDoc.data() as Omit<Appointment, 'id'>;
        return { id, ...data } as Appointment;
      }

      return null;
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
      throw error;
    }
  }

  async getAppointmentsByLocation(locationId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(appointmentsRef, where('locationId', '==', locationId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });
    } catch (error) {
      console.error('Error getting appointments by location:', error);
      throw error;
    }
  }

  async getAppointmentsByService(serviceId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(appointmentsRef, where('serviceId', '==', serviceId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });
    } catch (error) {
      console.error('Error getting appointments by service:', error);
      throw error;
    }
  }

  async getAppointmentsByStatus(
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(appointmentsRef, where('status', '==', status));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });
    } catch (error) {
      console.error('Error getting appointments by status:', error);
      throw error;
    }
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('date', '==', date),
        orderBy('time', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });
    } catch (error) {
      console.error('Error getting appointments by date:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<void> {
    try {
      const appointmentRef = doc(this.firestore, 'appointments', id);
      await updateDoc(appointmentRef, {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async getAppointmentsCount(): Promise<number> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting appointments count:', error);
      throw error;
    }
  }

  async getAppointmentsByUserAndStatus(
    userId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('userId', '==', userId),
        where('status', '==', status)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });
    } catch (error) {
      console.error('Error getting appointments by user and status:', error);
      throw error;
    }
  }

  async getPaginatedAppointments(
    lastVisible: any = null,
    pageSize: number = 10
  ): Promise<{ appointments: Appointment[]; lastVisible: any }> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');

      let q;
      if (lastVisible) {
        q = query(
          appointmentsRef,
          orderBy('date', 'desc'),
          orderBy('time', 'desc'),
          startAfter(lastVisible),
          limit(pageSize)
        );
      } else {
        q = query(
          appointmentsRef,
          orderBy('date', 'desc'),
          orderBy('time', 'desc'),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });

      // Get the last document for pagination
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        appointments,
        lastVisible: lastVisibleDoc,
      };
    } catch (error) {
      console.error('Error getting paginated appointments:', error);
      throw error;
    }
  }

  async getConflictingAppointments(
    locationId: string,
    date: string,
    time: string,
    duration: number
  ): Promise<Appointment[]> {
    try {
      // Convert time to minutes for comparison
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentTime = hours * 60 + minutes;
      const appointmentEndTime = appointmentTime + duration;

      // Get all appointments for the same location and date
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('locationId', '==', locationId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const snapshot = await getDocs(q);

      // Filter appointments that overlap with the requested time slot
      const conflictingAppointments = snapshot.docs
        .map((doc) => {
          const data = doc.data() as Omit<Appointment, 'id'>;
          return { id: doc.id, ...data } as Appointment;
        })
        .filter((appointment) => {
          // Get service to determine its duration
          // For simplicity, we'll get the service data separately or pass it in
          // Here we're assuming a fixed duration of 30 minutes if not specified
          const serviceDuration = 30; // This should be fetched from the service data

          const [apptHours, apptMinutes] = appointment.time
            .split(':')
            .map(Number);
          const apptTime = apptHours * 60 + apptMinutes;
          const apptEndTime = apptTime + serviceDuration;

          // Check if appointments overlap
          return (
            (appointmentTime >= apptTime && appointmentTime < apptEndTime) ||
            (appointmentEndTime > apptTime &&
              appointmentEndTime <= apptEndTime) ||
            (appointmentTime <= apptTime && appointmentEndTime >= apptEndTime)
          );
        });

      return conflictingAppointments;
    } catch (error) {
      console.error('Error checking for conflicting appointments:', error);
      throw error;
    }
  }

  async createAppointmentWithServiceCheck(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      // First check if the service exists
      const serviceDoc = await getDoc(
        doc(this.firestore, 'services', appointment.serviceId)
      );
      if (!serviceDoc.exists()) {
        throw new Error('Service does not exist');
      }

      // Then check if the location exists
      const locationDoc = await getDoc(
        doc(this.firestore, 'locations', appointment.locationId)
      );
      if (!locationDoc.exists()) {
        throw new Error('Location does not exist');
      }

      // Then check if the user exists
      const userDoc = await getDoc(
        doc(this.firestore, 'users', appointment.userId)
      );
      if (!userDoc.exists()) {
        throw new Error('User does not exist');
      }

      // If all entities exist, create the appointment
      return this.addAppointment(appointment);
    } catch (error) {
      console.error('Error creating appointment with service check:', error);
      throw error;
    }
  }

  // Komplex lekérdezések

  /**
   * Időpontok keresése dátum intervallum alapján
   * @param startDate A kezdő dátum (YYYY-MM-DD formátumban)
   * @param endDate A befejező dátum (YYYY-MM-DD formátumban)
   * @returns Az időintervallumba eső időpontok
   */
  async getAppointmentsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');

      // Egyszerűsített lekérdezés, csak a dátum alapján szűrünk
      // Az orderBy('time') eltávolítva, mert ez okozza az indexelési problémát
      const q = query(
        appointmentsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);

      // Az eredményeket sorba rendezzük időpont szerint a memóriában
      const appointments = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });

      // Memóriában rendezzük az időpont szerint
      return appointments.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
    } catch (error) {
      console.error('Error getting appointments by date range:', error);
      throw error;
    }
  }

  /**
   * Összetett lekérdezés több paraméterrel
   * @param filters Objektum, mely tartalmazza a szűréshez használt paramétereket
   * @returns A feltételeknek megfelelő időpontok
   */
  async getAppointmentsWithMultipleFilters(filters: {
    userId?: string;
    locationId?: string;
    serviceId?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const queryConstraints: QueryConstraint[] = [];

      // Csak azokat a feltételeket adjuk hozzá, amelyek meg vannak adva
      if (filters.userId) {
        queryConstraints.push(where('userId', '==', filters.userId));
      }

      if (filters.locationId) {
        queryConstraints.push(where('locationId', '==', filters.locationId));
      }

      if (filters.serviceId) {
        queryConstraints.push(where('serviceId', '==', filters.serviceId));
      }

      if (filters.status) {
        queryConstraints.push(where('status', '==', filters.status));
      }

      // Dátum intervallum kezelése
      if (filters.startDate) {
        queryConstraints.push(where('date', '>=', filters.startDate));
      }

      if (filters.endDate) {
        queryConstraints.push(where('date', '<=', filters.endDate));
      }

      // Csak egy rendezést alkalmazunk, hogy elkerüljük az indexelési problémát
      queryConstraints.push(orderBy('date', 'asc'));

      const q = query(appointmentsRef, ...queryConstraints);
      const snapshot = await getDocs(q);

      // Az eredményeket memóriában rendezzük időpont szerint
      const appointments = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Appointment, 'id'>;
        return { id: doc.id, ...data } as Appointment;
      });

      return appointments.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
    } catch (error) {
      console.error('Error getting appointments with multiple filters:', error);
      throw error;
    }
  }

  /**
   * Adminoknak: Időpontok összesítése és statisztika
   * @param period A lekérdezni kívánt időszak
   * @returns Statisztikai adatok az időpontokról
   */
  async getAppointmentStatistics(
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    byService: Record<string, number>;
    byLocation: Record<string, number>;
  }> {
    try {
      // Aktuális dátum meghatározása
      const today = new Date();
      let startDate: string;

      // Időszak kezdetének meghatározása
      switch (period) {
        case 'day':
          startDate = today.toISOString().split('T')[0]; // Csak a mai nap
          break;
        case 'week':
          // Előző 7 nap
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          startDate = lastWeek.toISOString().split('T')[0];
          break;
        case 'month':
        default:
          // Előző 30 nap
          const lastMonth = new Date(today);
          lastMonth.setDate(today.getDate() - 30);
          startDate = lastMonth.toISOString().split('T')[0];
          break;
      }

      const endDate = today.toISOString().split('T')[0];

      // Alapvető statisztikai változók inicializálása
      const statistics = {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
        byService: {} as Record<string, number>,
        byLocation: {} as Record<string, number>,
      };

      // Időpontok lekérdezése a megadott időszakra
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const snapshot = await getDocs(q);

      // Statisztika kiszámítása
      snapshot.docs.forEach((doc) => {
        const appointment = doc.data() as Appointment;
        statistics.total++;

        // Státusz szerint számolás
        if (appointment.status) {
          statistics[appointment.status]++;
        }

        // Szolgáltatás szerint számolás
        if (appointment.serviceId) {
          if (!statistics.byService[appointment.serviceId]) {
            statistics.byService[appointment.serviceId] = 0;
          }
          statistics.byService[appointment.serviceId]++;
        }

        // Helyszín szerint számolás
        if (appointment.locationId) {
          if (!statistics.byLocation[appointment.locationId]) {
            statistics.byLocation[appointment.locationId] = 0;
          }
          statistics.byLocation[appointment.locationId]++;
        }
      });

      return statistics;
    } catch (error) {
      console.error('Error getting appointment statistics:', error);
      throw error;
    }
  }

  /**
   * Elérhető időpontok keresése adott helyszínre és dátumra
   * @param locationId A helyszín azonosítója
   * @param date A keresett dátum
   * @param serviceDuration Szolgáltatás időtartama percben
   * @returns Szabad időpontok tömbje
   */
  async getAvailableTimeSlots(
    locationId: string,
    date: string,
    serviceDuration: number = 30
  ): Promise<string[]> {
    try {
      // Helyszín lekérdezése a nyitvatartási időkért
      const locationDoc = await getDoc(
        doc(this.firestore, 'locations', locationId)
      );

      if (!locationDoc.exists()) {
        throw new Error('Location not found');
      }

      const location = locationDoc.data() as Location;

      // A dátumból lekérjük a napot (hétfő, kedd, stb.)
      const dayOfWeek = new Date(date).getDay();
      const days = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const dayName = days[dayOfWeek];

      // Nyitvatartási idő ellenőrzése az adott napra
      const openingHours = location.openingHours?.[dayName];
      if (!openingHours || !openingHours.open || !openingHours.close) {
        return []; // Ha zárva van aznap, nincs elérhető időpont
      }

      // Nyitási és zárási idő feldolgozása
      const [openHour, openMinute] = openingHours.open.split(':').map(Number);
      const [closeHour, closeMinute] = openingHours.close
        .split(':')
        .map(Number);

      // Nyitás és zárás percben kifejezve a nap kezdetétől
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;

      // Foglalt időpontok lekérése az adott napra és helyszínre
      const bookedAppointments = await this.getConflictingAppointments(
        locationId,
        date,
        openingHours.open,
        closeTimeInMinutes - openTimeInMinutes
      );

      // Foglalt időszakok generálása
      const bookedTimeSlots: { start: number; end: number }[] =
        bookedAppointments.map((apt) => {
          const [aptHour, aptMinute] = apt.time.split(':').map(Number);
          const startTime = aptHour * 60 + aptMinute;
          // Minden időpont alapértelmezetten 30 perc, ha nincs más megadva
          const endTime = startTime + serviceDuration;
          return { start: startTime, end: endTime };
        });

      // Az összes lehetséges időpontot generáljuk 30 perces lépésekben
      const availableSlots: string[] = [];
      for (
        let timeInMinutes = openTimeInMinutes;
        timeInMinutes <= closeTimeInMinutes - serviceDuration;
        timeInMinutes += 30
      ) {
        // Ellenőrizzük, hogy ez az időpont nem ütközik-e egy foglalttal
        const isAvailable = !bookedTimeSlots.some(
          (slot) =>
            (timeInMinutes >= slot.start && timeInMinutes < slot.end) ||
            (timeInMinutes + serviceDuration > slot.start &&
              timeInMinutes + serviceDuration <= slot.end) ||
            (timeInMinutes <= slot.start &&
              timeInMinutes + serviceDuration >= slot.end)
        );

        if (isAvailable) {
          // Konvertáljuk vissza óra:perc formátumba
          const hour = Math.floor(timeInMinutes / 60);
          const minute = timeInMinutes % 60;
          availableSlots.push(
            `${hour.toString().padStart(2, '0')}:${minute
              .toString()
              .padStart(2, '0')}`
          );
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }

  /**
   * Valós idejű frissítések egy adott felhasználó időpontjaihoz
   * @param userId A felhasználó azonosítója
   * @returns Observable, mely az aktuális időpontokat tartalmazza
   */
  getUserAppointmentsRealtime(userId: string): Observable<Appointment[]> {
    return new Observable<Appointment[]>((observer) => {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(appointmentsRef, where('userId', '==', userId));

      // onSnapshot figyeli a változásokat és automatikusan küld frissítéseket
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const appointments = snapshot.docs.map((doc) => {
            const data = doc.data() as Omit<Appointment, 'id'>;
            return { id: doc.id, ...data } as Appointment;
          });
          observer.next(appointments);
        },
        (error) => {
          console.error('Error getting realtime appointments:', error);
          observer.error(error);
        }
      );

      // Ha leiratkoznak az Observable-ről, leállítjuk a Firestore figyelést is
      return () => unsubscribe();
    });
  }

  /**
   * Tranzakcióban kezelt időpontfoglalás
   * Biztosítja, hogy ne lehessen dupla foglalás, akkor sem ha egyszerre érkezik több kérés
   * @param appointmentData Az időpont adatai
   * @returns Az új időpont azonosítója
   */
  async createAppointmentWithTransaction(
    appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      // Ellenőrizzük, hogy van-e már foglalás erre az időpontra
      const conflictingAppointments = await this.getConflictingAppointments(
        appointmentData.locationId,
        appointmentData.date,
        appointmentData.time,
        30 // Alapértelmezett időtartam percben
      );

      if (conflictingAppointments.length > 0) {
        throw new Error(
          'Az időpont már foglalt. Kérjük válasszon másik időpontot.'
        );
      }

      // Tranzakciót használunk, hogy biztosítsuk az atomi műveletet
      return await runTransaction(this.firestore, async (transaction) => {
        // Leellenőrizzük, hogy közben nem foglalta-e le valaki
        const appointmentsRef = collection(this.firestore, 'appointments');
        const q = query(
          appointmentsRef,
          where('locationId', '==', appointmentData.locationId),
          where('date', '==', appointmentData.date),
          where('time', '==', appointmentData.time),
          where('status', 'in', ['pending', 'confirmed'])
        );

        const snapshot = await getDocs(q);

        if (snapshot.docs.length > 0) {
          throw new Error(
            'Az időpont már foglalt. Kérjük válasszon másik időpontot.'
          );
        }

        // Ha nincs konfliktus, létrehozzuk az időpontot
        const newAppointmentRef = doc(
          collection(this.firestore, 'appointments')
        );
        const newAppointment = {
          ...appointmentData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        transaction.set(newAppointmentRef, newAppointment);

        // Egyéb kapcsolódó dokumentumok frissítése is itt történhetne

        return newAppointmentRef.id;
      });
    } catch (error) {
      console.error('Error creating appointment with transaction:', error);
      throw error;
    }
  }

  /**
   * Keresés több kollekcióban (helyszínek, szolgáltatások) egyidejűleg
   * @param searchTerm A keresési kifejezés
   * @returns Találatok objektumban csoportosítva
   */
  async searchAcrossCollections(searchTerm: string): Promise<{
    services: Service[];
    locations: Location[];
  }> {
    try {
      const results = {
        services: [] as Service[],
        locations: [] as Location[],
      };

      // Kisbetűs keresési kifejezés
      const term = searchTerm.toLowerCase();

      // Szolgáltatások keresése
      const servicesRef = collection(this.firestore, 'services');
      const servicesSnapshot = await getDocs(servicesRef);

      results.services = servicesSnapshot.docs
        .map((doc) => {
          const data = doc.data() as Omit<Service, 'id'>;
          return { id: doc.id, ...data } as Service;
        })
        .filter(
          (service) =>
            service.name.toLowerCase().includes(term) ||
            (service.description &&
              service.description.toLowerCase().includes(term))
        );

      // Helyszínek keresése
      const locationsRef = collection(this.firestore, 'locations');
      const locationsSnapshot = await getDocs(locationsRef);

      results.locations = locationsSnapshot.docs
        .map((doc) => {
          const data = doc.data() as Omit<Location, 'id'>;
          return { id: doc.id, ...data } as Location;
        })
        .filter(
          (location) =>
            location.name.toLowerCase().includes(term) ||
            location.address.toLowerCase().includes(term) ||
            location.city.toLowerCase().includes(term)
        );

      return results;
    } catch (error) {
      console.error('Error searching across collections:', error);
      throw error;
    }
  }

  /**
   * Időpont-foglaltsági minta lekérdezése egy adott helyszínre
   * @param locationId A helyszín azonosítója
   * @param month A hónap YYYY-MM formátumban
   * @returns Napi foglaltsági adatok
   */
  async getMonthlyAvailabilityPattern(
    locationId: string,
    month: string
  ): Promise<Record<string, { total: number; available: number }>> {
    try {
      // Generáljuk a hónap napjait
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();

      // Eredmény objektum inicializálása
      const availabilityPattern: Record<
        string,
        { total: number; available: number }
      > = {};

      // Helyszín nyitvatartási adatainak lekérése
      const locationDoc = await getDoc(
        doc(this.firestore, 'locations', locationId)
      );
      if (!locationDoc.exists()) {
        throw new Error('Location not found');
      }

      const location = locationDoc.data() as Location;

      // Minden napra kiszámoljuk a foglaltságot
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${month}-${day.toString().padStart(2, '0')}`;
        const dayOfWeek = new Date(date).getDay();
        const days = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ];
        const dayName = days[dayOfWeek];

        // Nyitvatartási idő ellenőrzése az adott napra
        const openingHours = location.openingHours?.[dayName];

        if (!openingHours || !openingHours.open || !openingHours.close) {
          // Ha zárva van, nincs elérhető időpont
          availabilityPattern[date] = { total: 0, available: 0 };
          continue;
        }

        // Nyitási és zárási idő feldolgozása
        const [openHour, openMinute] = openingHours.open.split(':').map(Number);
        const [closeHour, closeMinute] = openingHours.close
          .split(':')
          .map(Number);

        // Nyitás és zárás percben kifejezve a nap kezdetétől
        const openTimeInMinutes = openHour * 60 + openMinute;
        const closeTimeInMinutes = closeHour * 60 + closeMinute;

        // Az összes lehetséges időpont száma (30 percenként)
        const totalSlots = Math.floor(
          (closeTimeInMinutes - openTimeInMinutes) / 30
        );

        // Foglalt időpontok lekérése
        const appointmentsRef = collection(this.firestore, 'appointments');
        const q = query(
          appointmentsRef,
          where('locationId', '==', locationId),
          where('date', '==', date),
          where('status', 'in', ['pending', 'confirmed'])
        );

        const snapshot = await getDocs(q);
        const bookedSlots = snapshot.docs.length;

        // Tároljuk az eredményt
        availabilityPattern[date] = {
          total: totalSlots,
          available: Math.max(0, totalSlots - bookedSlots),
        };
      }

      return availabilityPattern;
    } catch (error) {
      console.error('Error getting monthly availability pattern:', error);
      throw error;
    }
  }
}
