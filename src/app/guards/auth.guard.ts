import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Itt majd a valós authentikációs logika lesz
    const isAuthenticated = true; // Egyelőre mindig false

    if (!isAuthenticated) {
      this.router.navigate(['/bejelentkezes'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    return true;
  }
}
