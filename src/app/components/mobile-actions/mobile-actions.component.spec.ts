import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileActionsComponent } from './mobile-actions.component';

describe('MobileActionsComponent', () => {
  let component: MobileActionsComponent;
  let fixture: ComponentFixture<MobileActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
