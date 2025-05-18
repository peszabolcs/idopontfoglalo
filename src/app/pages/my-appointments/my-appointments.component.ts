import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { FirebaseService } from '../../services/firebase.service';
import { UserService } from '../../services/user.service';
import { Appointment } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentEditDialogComponent } from './appointment-edit-dialog/appointment-edit-dialog.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
  standalone: true,
  imports: [CommonModule, AppointmentListComponent, MatDialogModule],
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  allAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  showPastAppointments = false;
  isLoading = true;
  currentUserId: string | null = null;
  private userSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;

  constructor(
    private appointmentService: AppointmentService,
    private firebaseService: FirebaseService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserId = user.id ?? null;
        this.loadAppointments();
      } else {
        this.currentUserId = null;
        this.allAppointments = [];
        this.filteredAppointments = [];
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
  }

  loadAppointments(): void {
    this.isLoading = true;

    if (!this.currentUserId) {
      this.isLoading = false;
      return;
    }

    // Valós idejű frissítéseket használunk a Firebase-ből
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
    }

    this.appointmentsSubscription = this.firebaseService
      .getUserAppointmentsRealtime(this.currentUserId)
      .subscribe({
        next: (appointments: Appointment[]) => {
          console.log('Új foglalások betöltve:', appointments.length);
          this.allAppointments = appointments;
          this.filterAppointments();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading appointments:', error);
          this.snackBar.open(
            'Hiba történt az időpontok betöltése során',
            'Bezár',
            {
              duration: 3000,
            }
          );
          this.isLoading = false;
        },
      });
  }

  filterAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.showPastAppointments) {
      // Szűrés a múltbeli foglalásokra vagy a "completed/cancelled" státuszúakra
      this.filteredAppointments = this.allAppointments.filter((appointment) => {
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
      this.filteredAppointments = this.allAppointments.filter((appointment) => {
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
    this.showPastAppointments = showPast;
    this.filterAppointments();
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
              this.loadAppointments(); // Újratöltjük az időpontokat
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
        this.loadAppointments();
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
