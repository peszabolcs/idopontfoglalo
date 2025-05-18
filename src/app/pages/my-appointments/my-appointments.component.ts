import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { FirebaseService } from '../../services/firebase.service';
import { UserService } from '../../services/user.service';
import { Appointment } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentEditDialogComponent } from './appointment-edit-dialog/appointment-edit-dialog.component';
import { CommonModule } from '@angular/common';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  combineLatest,
  map,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
  standalone: true,
  imports: [CommonModule, AppointmentListComponent, MatDialogModule],
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  // BehaviorSubject to track the past/active toggle state
  private showPastAppointmentsSubject = new BehaviorSubject<boolean>(false);

  // Observable for the filtered appointments using the async pipe
  filteredAppointments$: Observable<Appointment[]> | null = null;

  // Property to easily access the current state in the template
  get showPastAppointments(): boolean {
    return this.showPastAppointmentsSubject.getValue();
  }

  isLoading = true;
  allAppointments: Appointment[] = [];
  currentUserId: string | null = null;
  private userSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;

  constructor(
    private appointmentService: AppointmentService,
    private firebaseService: FirebaseService,
    public userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserId = user.id ?? null;
        this.setupRealTimeAppointments();
      } else {
        this.currentUserId = null;
        this.allAppointments = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
    }
    // Ensure to complete BehaviorSubject
    this.showPastAppointmentsSubject.complete();
  }

  // Setup real-time appointments with async pipe support
  setupRealTimeAppointments(): void {
    if (!this.currentUserId) {
      this.isLoading = false;
      return;
    }

    // Create an observable for appointments using switchMap for proper chaining
    const appointments$ = this.userService.currentUser$.pipe(
      switchMap((user) => {
        if (!user || !user.id) {
          return new Observable<Appointment[]>((observer) => observer.next([]));
        }
        this.isLoading = true;
        return this.firebaseService.getUserAppointmentsRealtime(user.id);
      })
    );

    // Combine the appointments stream with the toggle state
    this.filteredAppointments$ = combineLatest([
      appointments$,
      this.showPastAppointmentsSubject,
    ]).pipe(
      map(([appointments, showPast]) => {
        this.isLoading = false;
        this.allAppointments = appointments;
        return this.filterAppointmentsByState(appointments, showPast);
      })
    );
  }

  // Helper method for filtering appointments
  private filterAppointmentsByState(
    appointments: Appointment[],
    showPast: boolean
  ): Appointment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (showPast) {
      // Szűrés a múltbeli foglalásokra vagy a "completed/cancelled" státuszúakra
      return appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);

        return (
          appointmentDate < today ||
          appointment.status === 'completed' ||
          appointment.status === 'cancelled'
        );
      });
    } else {
      // Szűrés az aktív foglalásokra (jövőbeli vagy "pending/confirmed" státuszúak)
      return appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);

        return (
          appointmentDate >= today &&
          (appointment.status === 'pending' ||
            appointment.status === 'confirmed')
        );
      });
    }
  }

  toggleAppointments(showPast: boolean): void {
    this.showPastAppointmentsSubject.next(showPast);
  }

  onAppointmentModified(appointmentId: string | undefined): void {
    if (appointmentId === undefined) {
      console.error('Appointment ID is undefined');
      return;
    }

    // Keressük meg a módosítandó időpontot
    const appointmentToEdit = this.allAppointments.find(
      (app) => app.id === appointmentId
    );

    if (!appointmentToEdit) {
      console.error('Appointment not found with ID:', appointmentId);
      return;
    }

    // Megnyitjuk a dialógusablakot az időpont adataival
    const dialogRef = this.dialog.open(AppointmentEditDialogComponent, {
      width: '450px', // Szélesebb dialógus a formhoz
      data: { appointment: appointmentToEdit },
    });

    dialogRef
      .afterClosed()
      .subscribe((updatedAppointment: Partial<Appointment> | undefined) => {
        if (updatedAppointment && updatedAppointment.id) {
          // Ha a felhasználó elmentette a módosításokat, frissítjük az időpontot
          this.isLoading = true;

          // Használjuk az AppointmentService-t a frissítéshez
          this.appointmentService
            .updateAppointment(
              updatedAppointment as Partial<Appointment> & {
                id: string | number;
              }
            )
            .then(() => {
              this.snackBar.open('Időpont sikeresen módosítva!', 'Bezár', {
                duration: 3000,
              });
            })
            .catch((error) => {
              console.error('Error updating appointment:', error);
              this.snackBar.open(
                'Hiba történt az időpont módosítása során',
                'Bezár',
                {
                  duration: 3000,
                }
              );
            })
            .finally(() => {
              this.isLoading = false;
            });
        }
      });
  }

  onAppointmentCancelled(appointmentId: string | undefined): void {
    if (appointmentId === undefined) {
      console.error('Appointment ID is undefined');
      return;
    }
    this.cancelAppointment(appointmentId);
  }

  cancelAppointment(id: string): void {
    // Módosítjuk az időpont státuszát "cancelled"-re, nem töröljük
    this.firebaseService
      .updateAppointmentStatus(id, 'cancelled')
      .then(() => {
        // Újratöltjük az időpontokat
        this.snackBar.open('Időpont sikeresen lemondva', 'Bezár', {
          duration: 3000,
        });
      })
      .catch((error: any) => {
        console.error('Error canceling appointment:', error);
        this.snackBar.open('Hiba történt az időpont lemondása során', 'Bezár', {
          duration: 3000,
        });
      });
  }
}
