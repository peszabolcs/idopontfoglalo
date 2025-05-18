import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { FirebaseService } from '../../services/firebase.service';
import { UserService } from '../../services/user.service';
import { Appointment } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
  standalone: true,
  imports: [CommonModule, AppointmentListComponent],
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  allAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  showPastAppointments = false;
  isLoading = true;
  currentUserId: string | null = null;
  private userSubscription?: Subscription;

  constructor(
    private appointmentService: AppointmentService,
    private firebaseService: FirebaseService,
    private userService: UserService,
    private snackBar: MatSnackBar
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
  }

  loadAppointments(): void {
    this.isLoading = true;

    if (!this.currentUserId) {
      this.isLoading = false;
      return;
    }

    // Használjuk a Firebase service-t az időpontok lekéréséhez
    this.firebaseService
      .getAppointmentsByUser(this.currentUserId)
      .then((appointments: Appointment[]) => {
        this.allAppointments = appointments;
        this.filterAppointments();
        this.isLoading = false;
      })
      .catch((error: any) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open(
          'Hiba történt az időpontok betöltése során',
          'Bezár',
          {
            duration: 3000,
          }
        );
        this.isLoading = false;
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
    // TODO: Implement appointment modification
    console.log('Appointment modified:', appointmentId);
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
