import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortText',
  standalone: true,
})
export class ShortTextPipe implements PipeTransform {
  transform(value: string | undefined, maxLength: number = 100): string {
    if (!value) {
      return '';
    }

    if (value.length <= maxLength) {
      return value;
    }

    return value.substring(0, maxLength) + '...';
  }
}
