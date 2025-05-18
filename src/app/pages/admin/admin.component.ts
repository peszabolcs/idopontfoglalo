import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import {
  Appointment,
  Service,
  Location,
  User as UserModel,
} from '../../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AdminComponent implements OnInit, AfterViewInit {
  // Adattárolók az adminisztrációs feladatokhoz
  activeAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  todaysAppointments: Appointment[] = [];
  appointmentStatistics: any = null;

  // Szolgáltatások és helyszínek adatai a megjelenítéshez
  services: Service[] = [];
  locations: Location[] = [];
  users: UserModel[] = [];

  // Dátum intervallum kereséshez
  startDate: string = new Date().toISOString().split('T')[0]; // Mai dátum
  endDate: string = new Date(new Date().setDate(new Date().getDate() + 30))
    .toISOString()
    .split('T')[0]; // 30 nappal később

  // Aktív nézet kezelése
  activeView: string = 'today';

  @ViewChild('statsContainer', { static: false }) statsContainer?: ElementRef;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    // Kezdeti adatok betöltése
    this.loadAllServices();
    this.loadAllLocations();
    this.loadAllUsers();
    this.loadTodaysAppointments();
    this.loadAppointmentStatistics();
  }

  ngAfterViewInit(): void {
    // A statisztikai nézet inicializálása után futó kód
    // Ellenőrizzük, hogy a statisztika nézet aktív-e
    if (this.activeView === 'statistics' && this.statsContainer) {
      console.log('Statisztikai nézet inicializálva');

      // Késleltetés használata az Angular változásdetektálási ciklus miatt
      setTimeout(() => {
        // A statisztikai adatok megjelenítésének vizuális kiemelése
        if (this.statsContainer?.nativeElement) {
          const element = this.statsContainer.nativeElement;

          // Például egy animáció vagy speciális stílus alkalmazása
          element.classList.add('stats-initialized');

          // Statisztikai kártyák fokozatos megjelenítése
          const statsCards = element.querySelectorAll('.stats-card');
          statsCards.forEach((card: HTMLElement, index: number) => {
            setTimeout(() => {
              card.classList.add('visible');
            }, 100 * index); // Kártyánként eltérő késleltetés
          });
        }
      }, 0);
    }
  }

  // Összes szolgáltatás betöltése
  loadAllServices(): void {
    this.firebaseService
      .getServices()
      .then((services) => {
        this.services = services;
      })
      .catch((error) => {
        console.error('Hiba a szolgáltatások betöltésekor:', error);
      });
  }

  // Összes helyszín betöltése
  loadAllLocations(): void {
    this.firebaseService
      .getLocations()
      .then((locations) => {
        this.locations = locations;
      })
      .catch((error) => {
        console.error('Hiba a helyszínek betöltésekor:', error);
      });
  }

  // Összes felhasználó betöltése
  loadAllUsers(): void {
    this.firebaseService
      .getAllUsers()
      .then((users) => {
        this.users = users;
      })
      .catch((error) => {
        console.error('Hiba a felhasználók betöltésekor:', error);
      });
  }

  // Segédfüggvények a nevek megjelenítéséhez ID alapján
  getServiceName(serviceId: string): string {
    const service = this.services.find((s) => s.id === serviceId);
    return service ? service.name : serviceId;
  }

  getLocationName(locationId: string): string {
    const location = this.locations.find((l) => l.id === locationId);
    return location ? location.name : locationId;
  }

  getUserName(userId: string): string {
    const user = this.users.find((u) => u.id === userId);
    return user ? user.name : userId;
  }

  // Segédmetódus objektum kulcsainak lekéréséhez a template-ben
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Mai napi foglalások lekérdezése
  loadTodaysAppointments(): void {
    const today = new Date().toISOString().split('T')[0];

    this.firebaseService
      .getAppointmentsByDateRange(today, today)
      .then((appointments) => {
        this.todaysAppointments = appointments;
      })
      .catch((error) => {
        console.error('Hiba a mai foglalások lekérdezésekor:', error);
      });
  }

  // Aktív foglalások lekérdezése
  loadActiveAppointments(): void {
    const today = new Date().toISOString().split('T')[0];

    this.firebaseService
      .getAppointmentsWithMultipleFilters({
        startDate: today,
        status: 'pending' as
          | 'pending'
          | 'confirmed'
          | 'cancelled'
          | 'completed',
      })
      .then((appointments) => {
        this.activeAppointments = appointments;
        this.activeView = 'active';
      })
      .catch((error) => {
        console.error('Hiba az aktív foglalások lekérdezésekor:', error);
      });
  }

  // Korábbi foglalások lekérdezése
  loadPastAppointments(): void {
    const today = new Date().toISOString().split('T')[0];
    const pastMonth = new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0];

    this.firebaseService
      .getAppointmentsByDateRange(pastMonth, today)
      .then((appointments) => {
        // Csak a befejezett vagy lemondott foglalásokat jelenítjük meg
        this.pastAppointments = appointments.filter(
          (app) => app.status === 'completed' || app.status === 'cancelled'
        );
        this.activeView = 'past';
      })
      .catch((error) => {
        console.error('Hiba a korábbi foglalások lekérdezésekor:', error);
      });
  }

  // Foglalások keresése dátum intervallum alapján
  searchAppointmentsByDateRange(): void {
    this.firebaseService
      .getAppointmentsByDateRange(this.startDate, this.endDate)
      .then((appointments) => {
        this.activeAppointments = appointments;
        this.activeView = 'dateRange';
      })
      .catch((error) => {
        console.error('Hiba az időintervallum lekérdezésekor:', error);
      });
  }

  // Statisztikák lekérdezése
  loadAppointmentStatistics(): void {
    this.firebaseService
      .getAppointmentStatistics('month')
      .then((stats) => {
        this.appointmentStatistics = stats;
      })
      .catch((error) => {
        console.error('Hiba a statisztikák lekérdezésekor:', error);
      });
  }

  // Foglalás állapotának frissítése
  updateAppointmentStatus(
    appointmentId: string,
    newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): void {
    this.firebaseService
      .updateAppointmentStatus(appointmentId, newStatus)
      .then(() => {
        // Frissítsük az aktív nézetet
        if (this.activeView === 'today') {
          this.loadTodaysAppointments();
        } else if (this.activeView === 'active') {
          this.loadActiveAppointments();
        } else if (this.activeView === 'past') {
          this.loadPastAppointments();
        } else if (this.activeView === 'dateRange') {
          this.searchAppointmentsByDateRange();
        }

        // Frissítsük a statisztikákat
        this.loadAppointmentStatistics();
      })
      .catch((error) => {
        console.error('Hiba a foglalás állapotának frissítésekor:', error);
      });
  }

  // Nézet váltás kezelése
  setActiveView(viewName: string): void {
    this.activeView = viewName;

    if (viewName === 'today') {
      this.loadTodaysAppointments();
    } else if (viewName === 'active') {
      this.loadActiveAppointments();
    } else if (viewName === 'past') {
      this.loadPastAppointments();
    }
  }
}
