import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class MyAppointmentsComponent {
  showPastAppointments = false;

  toggleAppointments(showPast: boolean) {
    this.showPastAppointments = showPast;
  }
}
