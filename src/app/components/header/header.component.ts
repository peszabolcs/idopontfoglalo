import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { User } from '../../models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = this.userService.isAdmin();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    try {
      await this.userService.logout();
      this.isMenuOpen = false; // Close mobile menu after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
