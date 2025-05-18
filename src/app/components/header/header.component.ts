import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
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
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() appTitle: string = 'Időpontfoglaló';
  @Input() isDarkMode: boolean = false;
  previousDarkMode: boolean = false;

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

  ngOnChanges(changes: SimpleChanges): void {
    // Kezeljük a bementi paraméterek változásait
    if (changes['isDarkMode'] && !changes['isDarkMode'].firstChange) {
      // Ha a sötét mód változik (nem az első betöltés)
      const newValue = changes['isDarkMode'].currentValue;
      const previousValue = changes['isDarkMode'].previousValue;

      console.log(`Sötét mód változott: ${previousValue} -> ${newValue}`);

      // Téma változásának kezelése
      if (newValue !== previousValue) {
        this.updateTheme(newValue);
      }
    }

    if (changes['appTitle']) {
      // Ha az alkalmazás címe változik, naplózzuk
      console.log(
        `Alkalmazás címe frissítve: ${changes['appTitle'].currentValue}`
      );

      // Ha szükséges, a DOM frissítése az új címmel
      this.updateAppTitle(changes['appTitle'].currentValue);
    }
  }

  /**
   * Téma frissítése a sötét mód alapján
   * @param isDark Sötét mód bekapcsolt állapota
   */
  private updateTheme(isDark: boolean): void {
    // A DOM-ban frissítjük a témát
    const body = document.querySelector('body');
    if (body) {
      if (isDark) {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
      } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
      }
    }

    // Mentsük el a jelenlegi értéket a későbbi összehasonlításokhoz
    this.previousDarkMode = isDark;

    // A localStorage-ban is eltároljuk a felhasználó preferenciáját
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  }

  /**
   * Alkalmazás címének frissítése a DOM-ban
   * @param title Új cím
   */
  private updateAppTitle(title: string): void {
    // Opcionális: a dokumentum címének frissítése
    if (title) {
      document.title = title;
    }
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
