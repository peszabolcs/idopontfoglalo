import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';

// Custom validator for password match
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terms: [false, [Validators.requiredTrue]],
      },
      { validators: passwordMatchValidator }
    );
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      try {
        this.isLoading = true;
        const { name, email, password } = this.registerForm.value;

        const userData = {
          name,
          email,
          password,
          isAdmin: false,
        };

        const user = await this.userService.register(userData);

        if (user) {
          this.snackBar.open('Sikeres regisztráció!', 'Bezár', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.router.navigate(['/']);
        } else {
          throw new Error('Nem sikerült a regisztráció.');
        }
      } catch (error: any) {
        let errorMessage = 'Hiba történt a regisztráció során.';

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Ez az email cím már használatban van.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Érvénytelen email cím.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'A jelszó túl gyenge. Használjon erősebb jelszót.';
        } else if (
          error.code === 'permission-denied' ||
          error.message?.includes('permission-denied')
        ) {
          // This is a Firestore permission issue, but user authentication may have succeeded
          console.warn('Firebase permission error during registration:', error);
          errorMessage =
            'Fiók létrehozva, de néhány adatot nem sikerült tárolni. Kérjük, jelentkezzen be újra később.';

          // Still consider this a partial success - navigate to home
          this.router.navigate(['/']);
          return;
        }

        this.snackBar.open(errorMessage, 'Bezár', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        console.error('Registration error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.registerForm.markAllAsTouched();
      this.snackBar.open(
        'Kérjük, töltse ki az összes kötelező mezőt helyesen!',
        'Bezár',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
