import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { StatusTranslatePipe } from '../../pipes/status-translate.pipe';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DateFormatPipe,
    TimeFormatPipe,
    StatusTranslatePipe,
  ],
  templateUrl: './appointment-card.component.html',
  styleUrl: './appointment-card.component.css',
})
export class AppointmentCardComponent {
  @Input() appointment!: Appointment;
  @Input() showActions: boolean = true;
  @Output() edit = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  // Service típusok és a hozzájuk tartozó megjelenítési nevek
  serviceTypes = [
    { value: 'szemelyi', viewValue: 'Személyi igazolvány' },
    { value: 'utlevel', viewValue: 'Útlevél' },
    { value: 'jogositvany', viewValue: 'Jogosítvány' },
    { value: 'lakcimkartya', viewValue: 'Lakcímkártya' },
    { value: 'other', viewValue: 'Egyéb' },
  ];

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'pending':
        return 'accent';
      case 'confirmed':
        return 'primary';
      case 'cancelled':
        return 'warn';
      case 'completed':
        return 'primary';
      default:
        return 'primary';
    }
  }

  // A service ID alapján visszaadja a megjelenítési nevet
  getServiceName(serviceId: string): string {
    const service = this.serviceTypes.find((s) => s.value === serviceId);
    return service ? service.viewValue : 'Egyéb';
  }

  isModifiable(): boolean {
    return (
      this.appointment &&
      this.appointment.status !== 'cancelled' &&
      this.appointment.status !== 'completed'
    );
  }

  onEdit(): void {
    this.edit.emit(this.appointment.id);
  }

  onCancel(): void {
    this.cancel.emit(this.appointment.id);
  }
}
