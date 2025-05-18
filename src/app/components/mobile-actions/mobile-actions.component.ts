import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-actions',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, RouterModule],
  templateUrl: './mobile-actions.component.html',
  styleUrl: './mobile-actions.component.css',
})
export class MobileActionsComponent {
  actions = [
    {
      icon: 'event_available',
      label: 'Új időpontfoglalás',
      route: '/idopontfoglalas',
    },
    { icon: 'list', label: 'Foglalásaim', route: '/foglalasaim' },
    { icon: 'person', label: 'Profilom', route: '/profil' },
    { icon: 'help', label: 'Gyakori kérdések', route: '/gyik' },
    { icon: 'contact_support', label: 'Kapcsolat', route: '/kapcsolat' },
  ];

  constructor(
    public bottomSheetRef: MatBottomSheetRef<MobileActionsComponent>
  ) {}

  openLink(route: string): void {
    this.bottomSheetRef.dismiss();
  }
}
