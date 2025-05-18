import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '../../models';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.css',
})
export class LocationSearchComponent implements OnInit {
  @Input() locations: Location[] = [];
  @Output() locationSelected = new EventEmitter<Location>();

  locationCtrl = new FormControl('');
  filteredLocations: Observable<Location[]>;

  constructor() {
    this.filteredLocations = this.locationCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterLocations(value || ''))
    );
  }

  ngOnInit(): void {}

  displayLocation(location: Location): string {
    return location && location.name
      ? `${location.name} - ${location.address}`
      : '';
  }

  private _filterLocations(value: string | Location): Location[] {
    let filterValue = '';

    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value) {
      filterValue = value.name.toLowerCase();
    }

    return this.locations.filter(
      (location) =>
        location.name.toLowerCase().includes(filterValue) ||
        location.address.toLowerCase().includes(filterValue) ||
        location.city.toLowerCase().includes(filterValue)
    );
  }

  onLocationSelected(location: Location): void {
    this.locationSelected.emit(location);
  }
}
