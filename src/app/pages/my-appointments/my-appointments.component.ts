import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
  standalone: true,
  imports: [CommonModule, AppointmentListComponent],
})
export class MyAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  showPastAppointments = false;

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService
      .getAllAppointments()
      .then((appointments: Appointment[]) => {
        this.appointments = appointments;
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
      });
  }

  toggleAppointments(showPast: boolean): void {
    this.showPastAppointments = showPast;
  }

  onAppointmentModified(appointmentId: number | undefined): void {
    if (appointmentId === undefined) {
      console.error('Appointment ID is undefined');
      return;
    }
    // TODO: Implement appointment modification
    console.log('Appointment modified:', appointmentId);
  }

  onAppointmentCancelled(appointmentId: number | undefined): void {
    if (appointmentId === undefined) {
      console.error('Appointment ID is undefined');
      return;
    }
    this.cancelAppointment(appointmentId);
  }

  cancelAppointment(id: number | undefined): void {
    if (id === undefined) {
      console.error('Appointment ID is undefined');
      return;
    }

    this.appointmentService
      .deleteAppointment(id)
      .then(() => {
        this.appointments = this.appointments.filter(
          (appointment) => appointment.id !== id
        );
        this.snackBar.open('Időpont sikeresen törölve', 'Bezár', {
          duration: 3000,
        });
      })
      .catch((error: any) => {
        console.error('Error canceling appointment:', error);
        this.snackBar.open('Hiba történt az időpont törlése során', 'Bezár', {
          duration: 3000,
        });
      });
  }
}
