import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule, MatIconModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  faqs = [
    {
      question: 'Hogyan foglalhatok időpontot?',
      answer:
        'Időpontfoglaláshoz először regisztrálnia kell, majd bejelentkezés után válassza az "Időpontfoglalás" menüpontot. A foglalás során ki kell választania az ügyintézési típust, helyszínt, dátumot és időpontot.',
    },
    {
      question: 'Hogyan tudom lemondani a foglalt időpontot?',
      answer:
        'A foglalt időpontot a "Foglalásaim" menüpontban tudja lemondani. Kattintson a lemondani kívánt időpontra, majd a "Lemondás" gombra.',
    },
    {
      question: 'Mi történik, ha nem érek oda a foglalt időpontra?',
      answer:
        'Ha nem tud megjelenni a foglalt időpontban, kérjük, mondja le legalább 24 órával korábban. Ellenkező esetben az időpont felhasználtnak minősül.',
    },
    {
      question: 'Hogyan tudom módosítani a profilom adatait?',
      answer:
        'A profil adatait a "Profil" menüpontban tudja módosítani. Kattintson a "Szerkesztés" gombra, majd mentse el a módosításokat.',
    },
    {
      question: 'Milyen ügyeket intézhetek az időpontfoglalással?',
      answer:
        'Ön személyi igazolvány, útlevél, jogosítvány és lakcímkártya ügyeket intézhet időpontfoglalással. Egyéb ügyek esetén válassza az "Egyéb" kategóriát.',
    },
    {
      question: 'Mikor kapok értesítést az időpontfoglalásomról?',
      answer:
        'Az időpontfoglalás után azonnal kap egy visszaigazoló e-mailt. Emellett az időpont előtt 24 órával emlékeztető e-mailt is küldünk.',
    },
  ];
}
