import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AppointmentService } from '../../services/appointment.service';
import {
  Appointment,
  Service,
  Location,
  User as UserModel,
} from '../../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AdminAppointmentEditDialogComponent } from './admin-appointment-edit-dialog/admin-appointment-edit-dialog.component';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
  ],
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
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

  // Valós idejű frissítések
  private appointmentsSubscription?: Subscription;

  @ViewChild('statsContainer', { static: false }) statsContainer?: ElementRef;

  constructor(
    private firebaseService: FirebaseService,
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Kezdeti adatok betöltése
    this.loadAllServices();
    this.loadAllLocations();
    this.loadAllUsers();
    this.setupAppointmentsListener();
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

  ngOnDestroy(): void {
    // Feliratkozások megszüntetése
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
    }
  }

  // Valós idejű adatfrissítés beállítása
  setupAppointmentsListener(): void {
    // Az aktuális nézetnek megfelelően állítjuk be a figyelőt
    this.loadTodaysAppointments();
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

    // Leiratkozunk a korábbi figyelőről, ha van
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
    }

    // Valós idejű frissítéseket használunk
    this.firebaseService
      .getAppointmentsByDateRange(today, today)
      .then((appointments) => {
        this.todaysAppointments = appointments;
        console.log('Mai foglalások betöltve:', appointments.length);

        // Most már figyelőt állítunk be a kollekció változásaira
        this.setupAllAppointmentsListener();
      })
      .catch((error) => {
        console.error('Hiba a mai foglalások lekérdezésekor:', error);
      });
  }

  // Beállítjuk a valós idejű figyelést az összes időpontra
  setupAllAppointmentsListener(): void {
    // Használjunk valós idejű frissítést az összes időpontra
    this.appointmentsSubscription = this.firebaseService
      .getAllAppointmentsRealtime()
      .subscribe({
        next: (appointments) => {
          console.log('Minden foglalás frissítve:', appointments.length);

          // Az aktív nézetnek megfelelően szűrjük az adatokat
          this.filterAppointmentsByView(appointments);
        },
        error: (error) => {
          console.error('Hiba az időpontok valós idejű figyelésében:', error);
        },
      });
  }

  // Szűrjük az időpontokat az aktív nézet alapján
  filterAppointmentsByView(appointments: Appointment[]): void {
    const today = new Date().toISOString().split('T')[0];

    if (this.activeView === 'today') {
      // Mai foglalások szűrése
      this.todaysAppointments = appointments.filter(
        (app) => app.date === today
      );
    } else if (this.activeView === 'active') {
      // Aktív foglalások (mai vagy jövőbeli, nem lemondott/befejezett)
      this.activeAppointments = appointments.filter(
        (app) =>
          app.date >= today &&
          (app.status === 'pending' || app.status === 'confirmed')
      );
    } else if (this.activeView === 'past') {
      // Múltbeli foglalások
      const pastMonth = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0];

      this.pastAppointments = appointments.filter(
        (app) =>
          (app.date < today ||
            app.status === 'completed' ||
            app.status === 'cancelled') &&
          app.date >= pastMonth
      );
    } else if (this.activeView === 'dateRange') {
      // Dátum intervallum szerinti szűrés
      this.activeAppointments = appointments.filter(
        (app) => app.date >= this.startDate && app.date <= this.endDate
      );
    }
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

  /**
   * Időpontfoglalás szerkesztése
   * @param appointment A szerkesztendő időpont
   */
  editAppointment(appointment: Appointment): void {
    // Megnyitjuk a szerkesztő dialógust
    const dialogRef = this.dialog.open(AdminAppointmentEditDialogComponent, {
      width: '550px',
      data: {
        appointment: { ...appointment },
        services: this.services,
        locations: this.locations,
        users: this.users.map((user) => ({ id: user.id, name: user.name })),
      },
    });

    // Figyeljük az eredményt
    dialogRef
      .afterClosed()
      .subscribe((updatedAppointment: Partial<Appointment> | undefined) => {
        if (updatedAppointment && updatedAppointment.id) {
          // Ha van eredmény, frissítjük az időpontot
          this.appointmentService
            .updateAppointment(
              updatedAppointment as Partial<Appointment> & {
                id: string | number;
              }
            )
            .then(() => {
              // Sikeres frissítés esetén értesítjük a felhasználót
              this.snackBar.open('Időpont sikeresen frissítve!', 'Bezár', {
                duration: 3000,
              });

              // Frissítjük a megjelenített adatokat
              this.refreshCurrentView();
            })
            .catch((error) => {
              console.error('Hiba az időpont frissítésekor:', error);
              this.snackBar.open(
                'Hiba történt az időpont frissítésekor!',
                'Bezár',
                {
                  duration: 3000,
                }
              );
            });
        }
      });
  }

  /**
   * Új időpontfoglalás létrehozása
   */
  createNewAppointment(): void {
    // Létrehozunk egy üres időpontot
    const newAppointment: Partial<Appointment> = {
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: this.users.length > 0 ? this.users[0].id! : '',
      serviceId: this.services.length > 0 ? this.services[0].id : '',
      locationId: this.locations.length > 0 ? this.locations[0].id : '',
    };

    // Megnyitjuk a szerkesztő dialógust
    const dialogRef = this.dialog.open(AdminAppointmentEditDialogComponent, {
      width: '550px',
      data: {
        appointment: newAppointment,
        services: this.services,
        locations: this.locations,
        users: this.users.map((user) => ({ id: user.id, name: user.name })),
      },
    });

    // Figyeljük az eredményt
    dialogRef
      .afterClosed()
      .subscribe((appointmentData: Partial<Appointment> | undefined) => {
        if (
          appointmentData &&
          appointmentData.userId &&
          appointmentData.serviceId &&
          appointmentData.date &&
          appointmentData.time
        ) {
          // Létrehozzuk az új időpontot
          const newAppointmentData = {
            userId: appointmentData.userId,
            serviceId: appointmentData.serviceId,
            locationId: appointmentData.locationId || 'budapest1',
            date: appointmentData.date,
            time: appointmentData.time,
            status: appointmentData.status || 'pending',
            notes: appointmentData.notes || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Mentjük az adatbázisba
          this.firebaseService
            .addAppointment(newAppointmentData)
            .then(() => {
              // Sikeres mentés esetén értesítjük a felhasználót
              this.snackBar.open(
                'Új időpontfoglalás sikeresen létrehozva!',
                'Bezár',
                {
                  duration: 3000,
                }
              );

              // Frissítjük a megjelenített adatokat
              this.refreshCurrentView();
            })
            .catch((error) => {
              console.error('Hiba az új időpont létrehozásakor:', error);
              this.snackBar.open(
                'Hiba történt az új időpont létrehozásakor!',
                'Bezár',
                {
                  duration: 3000,
                }
              );
            });
        }
      });
  }

  /**
   * Az aktuális nézet frissítése
   */
  refreshCurrentView(): void {
    if (this.activeView === 'today') {
      this.loadTodaysAppointments();
    } else if (this.activeView === 'active') {
      this.loadActiveAppointments();
    } else if (this.activeView === 'past') {
      this.loadPastAppointments();
    } else if (this.activeView === 'dateRange') {
      this.searchAppointmentsByDateRange();
    } else if (this.activeView === 'statistics') {
      this.loadAppointmentStatistics();
    }
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
