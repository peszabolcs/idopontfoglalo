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
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is authenticated using UserService
    const isAuthenticated = this.userService.isLoggedIn();

    if (!isAuthenticated) {
      this.router.navigate(['/bejelentkezes'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    return true;
  }
}
