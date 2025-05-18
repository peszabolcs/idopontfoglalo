import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FirebaseService } from '../../services/firebase.service';
import { Service } from '../../models';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
  ],
})
export class TestComponent implements OnInit {
  services: Service[] = [];
  newService: Omit<Service, 'id'> = {
    name: '',
    description: '',
    duration: 30,
    isActive: true,
    price: 0,
  };

  constructor(
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  async loadServices() {
    try {
      this.services = await this.firebaseService.getServices();
    } catch (error) {
      console.error('Error loading services:', error);
      this.snackBar.open(
        'Hiba történt a szolgáltatások betöltésekor',
        'Bezár',
        {
          duration: 3000,
        }
      );
    }
  }

  async addService() {
    try {
      await this.firebaseService.addService(this.newService);
      this.snackBar.open('Szolgáltatás sikeresen hozzáadva', 'Bezár', {
        duration: 3000,
      });
      this.newService = {
        name: '',
        description: '',
        duration: 30,
        isActive: true,
        price: 0,
      };
      await this.loadServices();
    } catch (error) {
      console.error('Error adding service:', error);
      this.snackBar.open('Hiba történt a szolgáltatás hozzáadásakor', 'Bezár', {
        duration: 3000,
      });
    }
  }

  async deleteService(id: string) {
    try {
      await this.firebaseService.deleteService(id);
      this.snackBar.open('Szolgáltatás sikeresen törölve', 'Bezár', {
        duration: 3000,
      });
      await this.loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      this.snackBar.open('Hiba történt a szolgáltatás törlésekor', 'Bezár', {
        duration: 3000,
      });
    }
  }
}
