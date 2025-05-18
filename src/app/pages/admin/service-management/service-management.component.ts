import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Service } from '../../../models';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.css'],
})
export class ServiceManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  serviceForm!: FormGroup;
  services: Service[] = [];
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  currentServiceId: string | null = null;
  displayedColumns: string[] = [
    'name',
    'description',
    'duration',
    'price',
    'isActive',
    'actions',
  ];

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServices();
  }

  ngAfterViewInit(): void {
    // Inicializáljuk a táblázat rendezését és lapozóját
    if (this.services.length > 0) {
      this.initTableControls();
    }
  }

  initForm(service?: Service): void {
    this.serviceForm = this.fb.group({
      name: [
        service?.name || '',
        [Validators.required, Validators.minLength(3)],
      ],
      description: [
        service?.description || '',
        [Validators.required, Validators.minLength(10)],
      ],
      duration: [
        service?.duration || 30,
        [Validators.required, Validators.min(5), Validators.max(240)],
      ],
      price: [service?.price || 0, [Validators.required, Validators.min(0)]],
      isActive: [service?.isActive !== undefined ? service.isActive : true],
    });

    this.isEditMode = !!service;
    this.currentServiceId = service?.id || null;
  }

  async loadServices(): Promise<void> {
    this.isLoading = true;
    try {
      const services = await this.serviceService.getAllServices();
      this.services = services;
      this.isLoading = false;

      // Ha vannak szolgáltatások, inicializáljuk a táblázat vezérlőit
      setTimeout(() => {
        if (this.services.length > 0) {
          this.initTableControls();
        }
      });
    } catch (error) {
      console.error('Hiba a szolgáltatások betöltésekor:', error);
      this.showErrorMessage(
        'Nem sikerült betölteni a szolgáltatásokat. Kérjük, próbálja újra később!'
      );
      this.isLoading = false;
    }
  }

  // Inicializálja a rendezést és lapozást a táblázathoz
  private initTableControls(): void {
    if (this.sort && this.paginator) {
      // A táblázat adatforrásának beállítása
      const dataSource = new MatTableDataSource<Service>(this.services);
      dataSource.sort = this.sort;
      dataSource.paginator = this.paginator;

      // A rendezés alapértelmezetten a név oszlop szerint történik
      this.sort.active = 'name';
      this.sort.direction = 'asc';

      // Felülírjuk a szolgáltatások tömböt a MatTableDataSource-szal
      this.services = dataSource as any;
    }
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.isSubmitting = true;
      const serviceData: Service = {
        ...this.serviceForm.value,
        id: this.currentServiceId || '',
      };

      const operation = this.isEditMode
        ? this.serviceService.updateService(serviceData)
        : this.serviceService.addService(serviceData);

      operation
        .then(() => {
          this.isSubmitting = false;
          this.showSuccessMessage(
            this.isEditMode
              ? 'A szolgáltatás sikeresen frissítve!'
              : 'Az új szolgáltatás sikeresen hozzáadva!'
          );
          this.resetForm();
          this.loadServices();
        })
        .catch((error) => {
          console.error('Hiba a szolgáltatás mentésekor:', error);
          this.isSubmitting = false;
          this.showErrorMessage(
            'Nem sikerült menteni a szolgáltatást. Kérjük, próbálja újra később!'
          );
        });
    } else {
      this.markFormGroupTouched(this.serviceForm);
    }
  }

  editService(service: Service): void {
    this.initForm(service);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteService(serviceId: string): void {
    if (confirm('Biztosan törölni szeretné ezt a szolgáltatást?')) {
      this.serviceService
        .deleteService(Number(serviceId))
        .then(() => {
          this.showSuccessMessage('A szolgáltatás sikeresen törölve!');
          this.loadServices();
          if (this.currentServiceId === serviceId) {
            this.resetForm();
          }
        })
        .catch((error) => {
          console.error('Hiba a szolgáltatás törlésekor:', error);
          this.showErrorMessage(
            'Nem sikerült törölni a szolgáltatást. Kérjük, próbálja újra később!'
          );
        });
    }
  }

  toggleServiceStatus(service: Service): void {
    const updatedService = {
      ...service,
      isActive: !service.isActive,
    };

    interface UpdateServiceResponse {
      // Define properties based on the actual response structure if known
    }

    interface UpdateServiceError {
      // Define properties based on the actual error structure if known
      message?: string;
      [key: string]: any;
    }

    this.serviceService
      .updateService(updatedService)
      .then(() => {
        this.showSuccessMessage(
          updatedService.isActive
            ? 'A szolgáltatás aktiválva!'
            : 'A szolgáltatás deaktiválva!'
        );
        this.loadServices();
      })
      .catch((error: any) => {
        console.error('Hiba a szolgáltatás státuszának módosításakor:', error);
        this.showErrorMessage(
          'Nem sikerült módosítani a szolgáltatás státuszát. Kérjük, próbálja újra később!'
        );
      });
  }

  resetForm(): void {
    this.serviceForm.reset({
      isActive: true,
      duration: 30,
      price: 0,
    });
    this.isEditMode = false;
    this.currentServiceId = null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.serviceForm.get(controlName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ez a mező kötelező';
    }

    if (controlName === 'name' && control.hasError('minlength')) {
      return 'A név legalább 3 karakter hosszú kell legyen';
    }

    if (controlName === 'description' && control.hasError('minlength')) {
      return 'A leírás legalább 10 karakter hosszú kell legyen';
    }

    if (controlName === 'duration') {
      if (control.hasError('min')) {
        return 'Az időtartam minimum 5 perc lehet';
      }
      if (control.hasError('max')) {
        return 'Az időtartam maximum 240 perc (4 óra) lehet';
      }
    }

    if (controlName === 'price' && control.hasError('min')) {
      return 'Az ár nem lehet negatív';
    }

    return '';
  }
}
