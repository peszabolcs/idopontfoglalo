import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqComponent } from '../../components/faq/faq.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterLink, FaqComponent],
})
export class HomeComponent {
  // Kezdőoldal komponens
}
