import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AppointmentBookingComponent {
  appointmentForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService
  ) {
    this.appointmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      service: ['', Validators.required],
      notes: [''],
    });
  }

  async onSubmit() {
    if (this.appointmentForm.valid) {
      try {
        await this.appointmentService.createAppointment(
          this.appointmentForm.value
        );
        this.successMessage = 'Időpont sikeresen foglalva!';
        this.errorMessage = '';
        this.appointmentForm.reset();
      } catch (error) {
        this.errorMessage = 'Hiba történt az időpont foglalása során.';
        this.successMessage = '';
      }
    } else {
      this.errorMessage = 'Kérjük, töltse ki az összes kötelező mezőt!';
      this.successMessage = '';
    }
  }
}
