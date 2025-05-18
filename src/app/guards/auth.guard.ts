import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Token frissítése aktív használat esetén
    this.userService.refreshToken();

    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    const isAuthenticated = this.userService.isLoggedIn();

    if (!isAuthenticated) {
      // Értesítjük a felhasználót, hogy be kell jelentkeznie
      this.snackBar.open(
        'Kérjük, jelentkezzen be az oldal megtekintéséhez',
        'Bezárás',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );

      // Átirányítjuk a bejelentkezési oldalra, és eltároljuk a céloldalt
      this.router.navigate(['/bejelentkezes'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Ellenőrizzük, hogy a felhasználónak van-e hozzáférési tokenje
    const token = this.userService.getAuthToken();
    if (!token) {
      this.snackBar.open(
        'Az Ön munkamenete lejárt. Kérjük, jelentkezzen be újra.',
        'Bezárás',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      this.router.navigate(['/bejelentkezes']);
      return false;
    }

    return true;
  }
}
