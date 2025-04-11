import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AppointmentService } from '../../services/appointment.service';
import { ServiceService } from '../../services/service.service';
import { LocationService } from '../../services/location.service';
import { User, Service, Location, Appointment } from '../../models';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class TestComponent implements OnInit {
  users: User[] = [];
  services: Service[] = [];
  locations: Location[] = [];
  appointments: Appointment[] = [];

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private serviceService: ServiceService,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    await this.testAllServices();
  }

  async testAllServices() {
    try {
      // Teszt felhasználó létrehozása
      const testUser: Omit<User, 'id' | 'createdAt' | 'lastLogin'> = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        isAdmin: false,
      };
      const userId = await this.userService.register(testUser);
      console.log('Created user with ID:', userId);

      // Teszt szolgáltatás létrehozása
      const testService: Omit<Service, 'id'> = {
        name: 'Személyi igazolvány',
        description: 'Személyi igazolvány igénylése',
        duration: 30,
        isActive: true,
        price: 3000,
      };
      const serviceId = await this.serviceService.addService(testService);
      console.log('Created service with ID:', serviceId);

      // Teszt helyszín létrehozása
      const testLocation: Omit<Location, 'id'> = {
        name: 'Központi Okmányiroda',
        address: 'Budapest, Váci út 60-62',
        city: 'Budapest',
        postalCode: '1134',
        openingHours: {
          monday: { open: '08:00', close: '16:00' },
          tuesday: { open: '08:00', close: '16:00' },
          wednesday: { open: '08:00', close: '16:00' },
          thursday: { open: '08:00', close: '16:00' },
          friday: { open: '08:00', close: '16:00' },
        },
        isActive: true,
      };
      const locationId = await this.locationService.addLocation(testLocation);
      console.log('Created location with ID:', locationId);

      // Teszt időpont létrehozása
      const testAppointment: Omit<
        Appointment,
        'id' | 'createdAt' | 'updatedAt' | 'status'
      > = {
        userId: userId,
        serviceId: serviceId,
        locationId: locationId,
        date: '2024-03-20',
        time: '10:00',
        notes: 'Teszt időpont',
      };
      const appointmentId = await this.appointmentService.createAppointment(
        testAppointment
      );
      console.log('Created appointment with ID:', appointmentId);

      // Összes adat lekérdezése
      this.users = await this.userService.getAllUsers();
      this.services = await this.serviceService.getAllServices();
      this.locations = await this.locationService.getAllLocations();
      this.appointments = await this.appointmentService.getAllAppointments();

      console.log('All users:', this.users);
      console.log('All services:', this.services);
      console.log('All locations:', this.locations);
      console.log('All appointments:', this.appointments);
    } catch (error) {
      console.error('Error during testing:', error);
    }
  }
}
