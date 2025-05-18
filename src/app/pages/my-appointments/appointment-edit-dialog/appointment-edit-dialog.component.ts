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
import { Appointment } from '../../../models';

@Component({
  selector: 'app-appointment-edit-dialog',
  templateUrl: './appointment-edit-dialog.component.html',
  styleUrls: ['./appointment-edit-dialog.component.css'],
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
export class AppointmentEditDialogComponent {
  editForm: FormGroup;
  services = [
    { value: 'szemelyi', viewValue: 'Személyi igazolvány' },
    { value: 'utlevel', viewValue: 'Útlevél' },
    { value: 'jogositvany', viewValue: 'Jogosítvány' },
    { value: 'lakcimkartya', viewValue: 'Lakcímkártya' },
    { value: 'other', viewValue: 'Egyéb' },
  ];

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
  ];

  minDate = new Date(); // A minimum dátum a mai nap

  constructor(
    private dialogRef: MatDialogRef<AppointmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: Appointment },
    private fb: FormBuilder
  ) {
    // Beállítjuk a minimum dátumot holnapra
    this.minDate.setDate(this.minDate.getDate() + 1);

    // A form inicializálása az időpont adataival
    this.editForm = this.fb.group({
      date: [new Date(data.appointment.date), Validators.required],
      time: [data.appointment.time, Validators.required],
      serviceId: [data.appointment.serviceId, Validators.required],
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
        date: formattedDate,
        time: formValue.time,
        serviceId: formValue.serviceId,
        notes: formValue.notes,
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
