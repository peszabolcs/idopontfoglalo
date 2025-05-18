import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  subjectOptions = [
    { value: 'general', viewValue: 'Általános kérdés' },
    {
      value: 'appointment',
      viewValue: 'Időpontfoglalással kapcsolatos kérdés',
    },
    { value: 'technical', viewValue: 'Technikai probléma' },
    { value: 'feedback', viewValue: 'Visszajelzés' },
    { value: 'other', viewValue: 'Egyéb' },
  ];

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['general', Validators.required],
      message: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Itt később a tényleges küldési logika implementálható
      // Például egy Contact service-en keresztül

      // Szimuláljuk a küldést
      setTimeout(() => {
        this.isSubmitting = false;
        this.showSuccessMessage();
        this.contactForm.reset({
          subject: 'general',
        });
      }, 1500);
    } else {
      this.markFormGroupTouched(this.contactForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  private showSuccessMessage(): void {
    this.snackBar.open(
      'Üzenetét sikeresen elküldtük! Hamarosan válaszolunk.',
      'Bezárás',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar'],
      }
    );
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ez a mező kötelező';
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Kérjük, adjon meg egy érvényes email címet';
    }

    if (controlName === 'name' && control.hasError('minlength')) {
      return 'A név legalább 2 karakter hosszú kell legyen';
    }

    if (controlName === 'message') {
      if (control.hasError('minlength')) {
        return 'Az üzenet legalább 10 karakter hosszú kell legyen';
      }
      if (control.hasError('maxlength')) {
        return 'Az üzenet nem lehet hosszabb 500 karakternél';
      }
    }

    return '';
  }
}
