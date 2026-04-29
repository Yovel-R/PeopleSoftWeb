import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    CommonModule, 
    LucideAngularModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'admin-page';
}
