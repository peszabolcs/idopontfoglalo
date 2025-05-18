import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusTranslate',
  standalone: true,
})
export class StatusTranslatePipe implements PipeTransform {
  private statusMap: Record<string, string> = {
    pending: 'Függőben',
    confirmed: 'Megerősítve',
    cancelled: 'Lemondva',
    completed: 'Teljesítve',
  };

  transform(value: string | undefined): string {
    if (!value) {
      return '';
    }

    return this.statusMap[value] || value;
  }
}
