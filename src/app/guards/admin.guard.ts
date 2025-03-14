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
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Itt majd a valós admin jogosultság ellenőrzés lesz
    const isAdmin = true; // Egyelőre mindig false

    if (!isAdmin) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
