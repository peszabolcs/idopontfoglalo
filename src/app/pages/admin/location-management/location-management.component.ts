import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '../../../models';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-location-management',
  templateUrl: './location-management.component.html',
  styleUrls: ['./location-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
  ],
})
export class LocationManagementComponent implements OnInit {
  locationForm: FormGroup;
  locations: Location[] = [];
  editMode = false;
  currentLocationId: string | null = null;
  displayedColumns: string[] = [
    'name',
    'address',
    'city',
    'postalCode',
    'isActive',
    'actions',
  ];

  days = [
    'Hétfő',
    'Kedd',
    'Szerda',
    'Csütörtök',
    'Péntek',
    'Szombat',
    'Vasárnap',
  ];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {
    this.locationForm = this.createLocationForm();
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  createLocationForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      isActive: [true],
      openingHours: this.fb.array(
        this.days.map((day) => this.createOpeningHoursGroup())
      ),
    });
  }

  createOpeningHoursGroup(): FormGroup {
    return this.fb.group({
      isOpen: [true],
      open: [
        '08:00',
        [
          Validators.required,
          Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
        ],
      ],
      close: [
        '18:00',
        [
          Validators.required,
          Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
        ],
      ],
    });
  }

  get openingHoursArray(): FormArray {
    return this.locationForm.get('openingHours') as FormArray;
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe((locations) => {
      this.locations = locations;
    });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      return;
    }

    const locationData = this.prepareLocationData();

    if (this.editMode && this.currentLocationId) {
      // Update existing location
      this.locationService
        .updateLocation({
          ...locationData,
          id: this.currentLocationId,
        })
        .subscribe({
          next: () => {
            this.snackBar.open('Helyszín sikeresen frissítve!', 'Bezár', {
              duration: 3000,
            });
            this.resetForm();
          },
          error: (error) => {
            this.snackBar.open(`Hiba történt: ${error.message}`, 'Bezár', {
              duration: 5000,
            });
          },
        });
    } else {
      // Create new location
      this.locationService.addLocation(locationData).subscribe({
        next: () => {
          this.snackBar.open('Helyszín sikeresen hozzáadva!', 'Bezár', {
            duration: 3000,
          });
          this.resetForm();
        },
        error: (error) => {
          this.snackBar.open(`Hiba történt: ${error.message}`, 'Bezár', {
            duration: 5000,
          });
        },
      });
    }
  }

  prepareLocationData(): Omit<Location, 'id'> {
    const formValue = this.locationForm.value;
    const openingHours: Record<string, any> = {};

    this.days.forEach((day, index) => {
      openingHours[day] = formValue.openingHours[index];
    });

    return {
      name: formValue.name,
      address: formValue.address,
      city: formValue.city,
      postalCode: formValue.postalCode,
      isActive: formValue.isActive,
      openingHours,
    };
  }

  editLocation(location: Location): void {
    this.editMode = true;
    this.currentLocationId = location.id;

    // Reset the form and create new openingHours FormArray
    this.locationForm = this.createLocationForm();

    // Set form values
    this.locationForm.patchValue({
      name: location.name,
      address: location.address,
      city: location.city,
      postalCode: location.postalCode,
      isActive: location.isActive,
    });

    // Set opening hours
    this.days.forEach((day, index) => {
      const dayOpeningHours = location.openingHours[day];
      if (dayOpeningHours) {
        (this.openingHoursArray.at(index) as FormGroup).patchValue({
          open: dayOpeningHours.open,
          close: dayOpeningHours.close,
        });
      }
    });
  }

  resetForm(): void {
    this.editMode = false;
    this.currentLocationId = null;
    this.locationForm.reset({
      isActive: true,
    });

    // Reset opening hours to default values
    this.openingHoursArray.controls.forEach((control) => {
      control.patchValue({
        isOpen: true,
        open: '08:00',
        close: '18:00',
      });
    });
  }

  deleteLocation(location: Location): void {
    if (
      confirm(`Biztosan törölni szeretné ezt a helyszínt: ${location.name}?`)
    ) {
      this.locationService.deleteLocation(location.id).subscribe({
        next: () => {
          this.snackBar.open('Helyszín sikeresen törölve!', 'Bezár', {
            duration: 3000,
          });
          // Reset form if we're editing this location
          if (this.currentLocationId === location.id) {
            this.resetForm();
          }
        },
        error: (error) => {
          this.snackBar.open(`Hiba történt: ${error.message}`, 'Bezár', {
            duration: 5000,
          });
        },
      });
    }
  }

  toggleLocationStatus(location: Location): void {
    const updatedLocation = { ...location, isActive: !location.isActive };

    this.locationService.updateLocation(updatedLocation as Location).subscribe({
      next: () => {
        const status: string = updatedLocation.isActive
          ? 'aktiválva'
          : 'deaktiválva';
        this.snackBar.open(`Helyszín sikeresen ${status}!`, 'Bezár', {
          duration: 3000,
        });
      },
      error: (error: { message: string }) => {
        this.snackBar.open(`Hiba történt: ${error.message}`, 'Bezár', {
          duration: 5000,
        });
      },
    });
  }

  // Form validation helpers
  hasError(controlName: string, errorName: string): boolean {
    const control = this.locationForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  getOpeningHoursErrorMessage(dayIndex: number, controlName: string): string {
    const control = (this.openingHoursArray.at(dayIndex) as FormGroup).get(
      controlName
    );

    if (control?.hasError('required') && control.touched) {
      return 'Ez a mező kötelező!';
    }

    if (control?.hasError('pattern') && control.touched) {
      return 'Helytelen formátum! (pl. 08:00)';
    }

    return '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }
}
