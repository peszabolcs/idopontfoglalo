import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class AppointmentBookingComponent implements OnInit {
  appointmentForm: FormGroup;
  services = [
    { value: 'szemelyi', viewValue: 'Személyi igazolvány' },
    { value: 'utlevel', viewValue: 'Útlevél' },
    { value: 'jogositvany', viewValue: 'Jogosítvány' },
    { value: 'lakcimkartya', viewValue: 'Lakcímkártya' },
    { value: 'other', viewValue: 'Egyéb' },
  ];
  isLoading = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Beállítjuk a minimum dátumot holnapra
    this.minDate.setDate(this.minDate.getDate() + 1);

    // Inicializáljuk az űrlapot
    this.appointmentForm = this.fb.group({
      service: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    if (!this.userService.isLoggedIn()) {
      this.snackBar.open('Időpontfoglaláshoz be kell jelentkezni!', 'Bezár', {
        duration: 3000,
      });
      this.router.navigate(['/bejelentkezes']);
    }
  }

  async onSubmit() {
    if (this.appointmentForm.valid) {
      try {
        this.isLoading = true;
        const formValue = this.appointmentForm.value;
        const date = new Date(formValue.date);
        const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        await this.appointmentService.createAppointment({
          ...formValue,
          date: formattedDate,
        });

        this.snackBar.open('Időpont sikeresen foglalva!', 'Bezár', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        // Sikeres foglalás után átirányítjuk a felhasználót a foglalásai oldalra
        this.router.navigate(['/foglalasaim']);
      } catch (error) {
        console.error('Error booking appointment:', error);
        this.snackBar.open(
          'Hiba történt az időpont foglalása során.',
          'Bezár',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
      } finally {
        this.isLoading = false;
      }
    } else {
      this.appointmentForm.markAllAsTouched();
      this.snackBar.open(
        'Kérjük, töltse ki az összes kötelező mezőt!',
        'Bezár',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
    }
  }
}
