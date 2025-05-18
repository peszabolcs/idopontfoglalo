import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '../../models';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './location-selector.component.html',
  styleUrl: './location-selector.component.css',
})
export class LocationSelectorComponent {
  @Input() locations: Location[] = [];
  @Input() selectedLocationId: string | null = null;
  @Input() label: string = 'Válasszon helyszínt';
  @Output() locationSelected = new EventEmitter<string>();

  onSelectionChange(locationId: string): void {
    this.locationSelected.emit(locationId);
  }
}
