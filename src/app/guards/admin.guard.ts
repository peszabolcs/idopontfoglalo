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
export class AdminGuard implements CanActivate {
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

    // Először ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    if (!this.userService.isLoggedIn()) {
      this.snackBar.open(
        'Kérjük, jelentkezzen be az admin felület eléréséhez',
        'Bezárás',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );

      this.router.navigate(['/bejelentkezes'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Ezután ellenőrizzük, hogy a felhasználó admin-e
    const isAdmin = this.userService.isAdmin();

    if (!isAdmin) {
      this.snackBar.open(
        'Nincs jogosultsága az admin felület megtekintéséhez',
        'Bezárás',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );

      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
