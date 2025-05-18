import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAppointmentEditDialogComponent } from './admin-appointment-edit-dialog.component';

describe('AdminAppointmentEditDialogComponent', () => {
  let component: AdminAppointmentEditDialogComponent;
  let fixture: ComponentFixture<AdminAppointmentEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAppointmentEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAppointmentEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
