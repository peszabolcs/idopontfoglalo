import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MobileActionsComponent } from './components/mobile-actions/mobile-actions.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatBottomSheetModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
})
export class AppComponent {
  title = 'Időpontfoglaló App';
  isMobile = false;

  constructor(private bottomSheet: MatBottomSheet) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  openMobileActions(): void {
    this.bottomSheet.open(MobileActionsComponent);
  }
}
