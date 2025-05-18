import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // First check if user is logged in
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/bejelentkezes'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Then check if user has admin privileges
    const isAdmin = this.userService.isAdmin();

    if (!isAdmin) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
