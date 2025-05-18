import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: string | undefined): string {
    if (!time) {
      return '';
    }

    // Split the time into hours and minutes
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return time;
    }

    // Format based on 12-hour clock with am/pm
    const period = hours >= 12 ? 'du.' : 'de.';
    const formattedHour = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${period} ${formattedHour}:${minutes.toString().padStart(2, '0')}`;
  }
}
