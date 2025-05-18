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
import { MatStepperModule } from '@angular/material/stepper';
import { LocationService } from '../../services/location.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FocusDirective } from '../../directives/focus.directive';
import { TimeValidatorDirective } from '../../directives/time-validator.directive';
import { HighlightDirective } from '../../directives/highlight.directive';

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
    MatStepperModule,
    FocusDirective,
    TimeValidatorDirective,
    HighlightDirective,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class AppointmentBookingComponent implements OnInit {
  serviceFormGroup: FormGroup;
  dateTimeFormGroup: FormGroup;
  locationFormGroup: FormGroup;
  detailsFormGroup: FormGroup;
  appointmentForm: FormGroup;
  isLinear = true;

  services = [
    { value: 'szemelyi', viewValue: 'Személyi igazolvány' },
    { value: 'utlevel', viewValue: 'Útlevél' },
    { value: 'jogositvany', viewValue: 'Jogosítvány' },
    { value: 'lakcimkartya', viewValue: 'Lakcímkártya' },
    { value: 'other', viewValue: 'Egyéb' },
  ];

  // Elérhető időpontok listája
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

  isLoading = false;
  minDate = new Date();
  locations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private locationService: LocationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Beállítjuk a minimum dátumot holnapra
    this.minDate.setDate(this.minDate.getDate() + 1);

    // Inicializáljuk az űrlapokat lépésenként
    this.serviceFormGroup = this.fb.group({
      service: ['', Validators.required],
    });

    this.locationFormGroup = this.fb.group({
      locationId: ['', Validators.required],
    });

    this.dateTimeFormGroup = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
    });

    this.detailsFormGroup = this.fb.group({
      notes: [''],
    });

    // A régi forma, amit megtartunk a kompatibilitás miatt
    this.appointmentForm = this.fb.group({
      service: ['', Validators.required],
      locationId: ['', Validators.required],
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
      return;
    }

    // Betöltjük a helyszíneket
    this.loadLocations();

    // Form változások követése, hogy szinkronban legyenek az űrlapok
    this.serviceFormGroup.get('service')?.valueChanges.subscribe((value) => {
      console.log('Service selected:', value);
      const selectedService = this.services.find(
        (service) => service.value === value
      );
      console.log('Found service object:', selectedService);
      this.appointmentForm.get('service')?.setValue(value);
    });

    this.locationFormGroup
      .get('locationId')
      ?.valueChanges.subscribe((value) => {
        this.appointmentForm.get('locationId')?.setValue(value);
      });

    this.dateTimeFormGroup.get('date')?.valueChanges.subscribe((value) => {
      this.appointmentForm.get('date')?.setValue(value);
    });

    this.dateTimeFormGroup.get('time')?.valueChanges.subscribe((value) => {
      this.appointmentForm.get('time')?.setValue(value);
    });

    this.detailsFormGroup.get('notes')?.valueChanges.subscribe((value) => {
      this.appointmentForm.get('notes')?.setValue(value);
    });
  }

  loadLocations() {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => {
        console.error('Hiba a helyszínek betöltése során:', err);
        this.snackBar.open('Nem sikerült betölteni a helyszíneket', 'Bezár', {
          duration: 3000,
        });
      },
    });
  }

  /**
   * Visszaadja a kiválasztott szolgáltatás megjelenítési nevét
   */
  getSelectedServiceViewValue(): string {
    const selectedValue = this.serviceFormGroup.get('service')?.value;
    const selectedService = this.services.find(
      (service) => service.value === selectedValue
    );
    return selectedService ? selectedService.viewValue : 'Nem választott';
  }

  /**
   * Visszaadja a kiválasztott helyszín nevét
   */
  getSelectedLocationName(): string {
    const selectedId = this.locationFormGroup.get('locationId')?.value;
    const selectedLocation = this.locations.find(
      (location) => location.id === selectedId
    );
    return selectedLocation ? selectedLocation.name : '';
  }

  async onSubmit() {
    if (this.appointmentForm.valid) {
      try {
        this.isLoading = true;

        // Közvetlenül az űrlapokból olvassuk ki az értékeket, hogy elkerüljük a szinkronizációs problémákat
        const serviceValue = this.serviceFormGroup.get('service')?.value;
        const locationIdValue = this.locationFormGroup.get('locationId')?.value;
        const dateValue = this.dateTimeFormGroup.get('date')?.value;
        const timeValue = this.dateTimeFormGroup.get('time')?.value;
        const notesValue = this.detailsFormGroup.get('notes')?.value;

        // Dátum kezelése időzóna-független módon
        // Ez a megoldás biztosítja, hogy a kiválasztott dátum pontosan legyen elmentve a szerveren
        let formattedDate = '';
        if (dateValue) {
          // Ha Date objektum, akkor biztonságosan formázzuk
          if (dateValue instanceof Date) {
            // Nap, hónap, év kinyerése külön-külön az időzóna hatás elkerülésére
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0'); // Hónapok 0-tól indexeltek
            const day = String(dateValue.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          } else {
            // Ha már string formátumban van
            formattedDate = dateValue;
          }
        }

        console.log('Foglalás adatai:', {
          service: serviceValue,
          locationId: locationIdValue,
          date: formattedDate,
          time: timeValue,
        });

        // Foglalás létrehozása a korrekt adatokkal
        await this.appointmentService.createAppointment({
          service: serviceValue,
          locationId: locationIdValue,
          date: formattedDate,
          time: timeValue,
          notes: notesValue || '',
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
