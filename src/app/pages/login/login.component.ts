import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        this.isLoading = true;
        const { email, password } = this.loginForm.value;

        const user = await this.userService.login(email, password);

        if (user) {
          console.log('Bejelentkezett felhasználó:', user);
          console.log(
            'Admin jogosultság:',
            user.isAdmin === true ? 'IGEN' : 'NEM'
          );

          this.snackBar.open(
            `Sikeres bejelentkezés! Admin jogosultság: ${
              user.isAdmin === true ? 'IGEN' : 'NEM'
            }`,
            'Bezár',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
          this.router.navigate(['/']);
        } else {
          this.snackBar.open('Hibás email cím vagy jelszó!', 'Bezár', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      } catch (error: any) {
        let errorMessage = 'Hiba történt a bejelentkezés során.';

        // Handle specific Firebase errors
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          errorMessage = 'Hibás email cím vagy jelszó!';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage =
            'Túl sok sikertelen bejelentkezési kísérlet. Kérjük, próbálja meg később.';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'Ez a felhasználói fiók le van tiltva.';
        }

        this.snackBar.open(errorMessage, 'Bezár', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        console.error('Login error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
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
}
