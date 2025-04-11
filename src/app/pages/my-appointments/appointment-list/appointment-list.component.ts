import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AppointmentListComponent {
  @Input() appointments: Appointment[] = [];
  @Input() showPastAppointments: boolean = false;
  @Output() appointmentModified = new EventEmitter<number | undefined>();
  @Output() appointmentCancelled = new EventEmitter<number | undefined>();

  onModify(appointmentId: number | undefined) {
    this.appointmentModified.emit(appointmentId);
  }

  onCancel(appointmentId: number | undefined) {
    this.appointmentCancelled.emit(appointmentId);
  }
}
