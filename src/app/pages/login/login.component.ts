import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [RouterLink],
})
export class LoginComponent {
  isLoginTab = true;

  toggleTab(isLogin: boolean) {
    this.isLoginTab = isLogin;
  }
}
