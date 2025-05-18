import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { StatusTranslatePipe } from '../../../pipes/status-translate.pipe';
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';
import { ShortTextPipe } from '../../../pipes/short-text.pipe';
import { RouterModule } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    DateFormatPipe,
    StatusTranslatePipe,
    TimeFormatPipe,
    ShortTextPipe,
  ],
})
export class AppointmentListComponent {
  @Input() appointments: Appointment[] = [];
  @Input() showPastAppointments: boolean = false;
  @Output() appointmentModified = new EventEmitter<string | undefined>();
  @Output() appointmentCancelled = new EventEmitter<string | undefined>();

  constructor(
    private locationService: LocationService,
    private serviceService: ServiceService
  ) {}

  getStatusText(status: string): string {
    // Ez a metódus lecserélhető a StatusTranslatePipe-ra
    // Megtartjuk a kompatibilitás érdekében
    switch (status) {
      case 'pending':
        return 'Függőben';
      case 'confirmed':
        return 'Megerősítve';
      case 'cancelled':
        return 'Lemondva';
      case 'completed':
        return 'Teljesítve';
      default:
        return 'Ismeretlen';
    }
  }

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

  isAppointmentModifiable(appointment: Appointment): boolean {
    // Csak akkor módosítható, ha nem lemondott és nem teljesített
    return (
      appointment.status !== 'cancelled' && appointment.status !== 'completed'
    );
  }

  getLocationName(locationId: string): string {
    return this.locationService.getLocationName(locationId);
  }

  getLocationAddress(locationId: string): string {
    return this.locationService.getLocationInfo(locationId).address;
  }

  getServiceName(serviceId: string): string {
    // Az egyszerűség kedvéért itt használjuk a hardcoded listát
    const services: { [key: string]: string } = {
      szemelyi: 'Személyi igazolvány',
      utlevel: 'Útlevél',
      jogositvany: 'Jogosítvány',
      lakcimkartya: 'Lakcímkártya',
      other: 'Egyéb',
    };

    return services[serviceId] || serviceId;
  }

  onModify(appointmentId: string | undefined) {
    this.appointmentModified.emit(appointmentId);
  }

  onCancel(appointmentId: string | undefined) {
    this.appointmentCancelled.emit(appointmentId);
  }
}
