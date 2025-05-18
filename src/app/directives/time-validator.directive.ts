import { Directive, Input } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Directive({
  selector: '[appTimeValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: TimeValidatorDirective,
      multi: true,
    },
  ],
  standalone: true,
})
export class TimeValidatorDirective implements Validator {
  @Input('appTimeValidator') workHours: { start: string; end: string } = {
    start: '08:00',
    end: '17:00',
  };

  validate(control: AbstractControl): ValidationErrors | null {
    // If no value, return null (other validators will handle required)
    if (!control.value) {
      return null;
    }

    const selectedTime = control.value;

    // Make sure we're dealing with a string in HH:MM format
    if (
      typeof selectedTime !== 'string' ||
      !/^\d{2}:\d{2}$/.test(selectedTime)
    ) {
      return { invalidTimeFormat: true };
    }

    // Convert times to minutes for easier comparison
    const selectedMinutes = this.timeToMinutes(selectedTime);
    const startMinutes = this.timeToMinutes(this.workHours.start);
    const endMinutes = this.timeToMinutes(this.workHours.end);

    // Validate that time is within work hours
    if (selectedMinutes < startMinutes || selectedMinutes > endMinutes) {
      return {
        outsideWorkHours: {
          start: this.workHours.start,
          end: this.workHours.end,
          actual: selectedTime,
        },
      };
    }

    return null;
  }

  // Helper function to convert time string (HH:MM) to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
