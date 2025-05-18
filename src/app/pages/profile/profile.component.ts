import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { User } from '../../models';
import { UserService } from '../../services/user.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [
        '',
        Validators.pattern(
          /^(\+36|06)[ -]?(1|20|30|70)[ -]?[\d]{3}[ -]?[\d]{4}$/
        ),
      ],
      emailNotifications: [true],
      smsNotifications: [false],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.loadUserData(user);
      }
    });
  }

  loadUserData(user: User): void {
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      emailNotifications: user.emailNotifications || true,
      smsNotifications: user.smsNotifications || false,
    });
  }

  getUserInitials(user: User): string {
    if (!user || !user.name) return '?';

    return user.name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.profileForm.dirty) return;

    this.loading = true;
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.snackBar.open('Felhasználói azonosító nem található!', 'Bezár', {
        duration: 3000,
      });
      this.loading = false;
      return;
    }

    const userData = {
      name: this.profileForm.get('name')?.value,
      phone: this.profileForm.get('phone')?.value,
      emailNotifications: this.profileForm.get('emailNotifications')?.value,
      smsNotifications: this.profileForm.get('smsNotifications')?.value,
    };

    this.firebaseService
      .updateUser(currentUser.id, userData)
      .then(() => {
        this.snackBar.open('Profil sikeresen frissítve!', 'Bezár', {
          duration: 3000,
        });
        this.profileForm.markAsPristine();
      })
      .catch((error) => {
        console.error('Hiba a profil mentésénél:', error);
        this.snackBar.open('Hiba történt a profil mentése során!', 'Bezár', {
          duration: 3000,
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    // Itt kellene megvalósítani a Firebase jelszó változtatást
    // Ez egy jövőbeli fejlesztési lehetőség

    // Példa implementáció (nem működik, mivel a Firebase nem támogatja közvetlenül)
    this.snackBar.open(
      'A jelszó változtatás funkció még fejlesztés alatt áll',
      'Bezár',
      { duration: 5000 }
    );
    this.passwordForm.reset();
    this.loading = false;
  }

  resetForm(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.loadUserData(user);
    }
    this.profileForm.markAsPristine();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
