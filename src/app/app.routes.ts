import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AppointmentBookingComponent } from './pages/appointment-booking/appointment-booking.component';
import { MyAppointmentsComponent } from './pages/my-appointments/my-appointments.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'idopontfoglalas',
    component: AppointmentBookingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'foglalasaim',
    component: MyAppointmentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profil',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'bejelentkezes', component: LoginComponent },
  { path: 'regisztracio', component: RegisterComponent },
  { path: '**', component: NotFoundComponent },
];
