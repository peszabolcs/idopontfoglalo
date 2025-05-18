import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Appointment, Service, Location as AppLocation } from '../../../models';

@Component({
  selector: 'app-admin-appointment-edit-dialog',
  templateUrl: './admin-appointment-edit-dialog.component.html',
  styleUrls: ['./admin-appointment-edit-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class AdminAppointmentEditDialogComponent {
  editForm: FormGroup;

  // Időpont státusz opciók
  statusOptions = [
    { value: 'pending', viewValue: 'Függőben' },
    { value: 'confirmed', viewValue: 'Megerősítve' },
    { value: 'completed', viewValue: 'Teljesítve' },
    { value: 'cancelled', viewValue: 'Lemondva' },
  ];

  // Időpontok
  availableTimes: string[] = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ];

  minDate = new Date(); // A minimum dátum a mai nap

  constructor(
    private dialogRef: MatDialogRef<AdminAppointmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      appointment: Appointment;
      services: Service[];
      locations: AppLocation[];
      users: { id: string; name: string }[];
    },
    private fb: FormBuilder
  ) {
    // Beállítjuk a minimum dátumot holnapra csak új foglalásokhoz
    if (!data.appointment.id) {
      this.minDate.setDate(this.minDate.getDate() + 1);
    } else {
      // Létező foglalásokat a múltban is lehet szerkeszteni
      this.minDate = new Date(1970, 0, 1);
    }

    // A form inicializálása az időpont adataival
    this.editForm = this.fb.group({
      userId: [data.appointment.userId, Validators.required],
      serviceId: [data.appointment.serviceId, Validators.required],
      locationId: [data.appointment.locationId, Validators.required],
      date: [
        data.appointment.date ? new Date(data.appointment.date) : new Date(),
        Validators.required,
      ],
      time: [data.appointment.time || '08:00', Validators.required],
      status: [data.appointment.status || 'pending', Validators.required],
      notes: [data.appointment.notes || ''],
    });
  }

  /**
   * A dialógus bezárása az adatok mentésével
   */
  onSave(): void {
    if (this.editForm.valid) {
      // Formázás előtt formatáljuk a dátumot YYYY-MM-DD formátumra
      const formValue = this.editForm.value;
      const date = formValue.date;
      const formattedDate = date.toISOString().split('T')[0];

      // A frissített időpont adatok
      const updatedAppointment: Partial<Appointment> = {
        ...this.data.appointment,
        userId: formValue.userId,
        serviceId: formValue.serviceId,
        locationId: formValue.locationId,
        date: formattedDate,
        time: formValue.time,
        status: formValue.status,
        notes: formValue.notes,
        updatedAt: new Date(),
      };

      this.dialogRef.close(updatedAppointment);
    }
  }

  /**
   * A dialógus bezárása mentés nélkül
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
