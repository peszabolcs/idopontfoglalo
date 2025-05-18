import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../models';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-service-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './service-selector.component.html',
  styleUrl: './service-selector.component.css',
})
export class ServiceSelectorComponent {
  @Input() services: Service[] = [];
  @Input() selectedServiceId: string | null = null;
  @Input() label: string = 'Válasszon szolgáltatást';
  @Output() serviceSelected = new EventEmitter<string>();

  onSelectionChange(serviceId: string): void {
    this.serviceSelected.emit(serviceId);
  }
}
