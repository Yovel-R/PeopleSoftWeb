import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'admin-page';
  router = inject(Router);

  userRole = signal<string | null>(localStorage.getItem('user_role'));

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }

  logout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
    this.userRole.set(null);
    this.router.navigate(['/login']);
  }
}
