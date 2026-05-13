import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { StudentsIcon, WorkflowSquare03Icon, DashboardSquareRemoveIcon, Settings01Icon, SignatureIcon } from '@hugeicons/core-free-icons';
import { ApiService } from './services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    CommonModule,
    HugeiconsIconComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'admin-page';
  router = inject(Router);
  readonly StudentsIcon = StudentsIcon;
  readonly WorkflowSquare03Icon = WorkflowSquare03Icon;
  readonly DashboardSquareRemoveIcon = DashboardSquareRemoveIcon;
  readonly Settings01Icon = Settings01Icon;
  readonly SignatureIcon = SignatureIcon;

  userRole = signal<string | null>(localStorage.getItem('user_role'));
  hasNotifications = signal<boolean>(false);
  notificationItems = signal<any[]>([]);
  showNotifications = signal<boolean>(false);
  apiService = inject(ApiService);

  constructor() {
    if (this.userRole() === 'hr') {
      this.checkNotifications();
      // Poll every 2 minutes
      setInterval(() => this.checkNotifications(), 120000);
    }
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.checkNotifications();
    }
  }

  checkNotifications() {
    forkJoin({
      leaves: this.apiService.getHrPendingLeaves(),
      requests: this.apiService.getHrPendingAttendanceRequests(),
      applications: this.apiService.getAllActiveInterns('all', 'initial'),
      offboarding: this.apiService.getPendingOffboarding()
    }).subscribe({
      next: (data) => {
        const items: any[] = [];
        
        if (data.leaves) {
          data.leaves.forEach((l: any) => items.push({
            type: 'Leave Request',
            title: l.employeeName || 'Staff Member',
            desc: `${l.leaveType}: ${l.reason}`,
            link: '/employees',
            icon: 'fa-solid fa-calendar-minus',
            color: 'orange'
          }));
        }

        if (data.requests) {
          data.requests.forEach((r: any) => items.push({
            type: 'Attendance Correction',
            title: r.employeeName || 'Staff Member',
            desc: `Correction for ${new Date(r.date).toLocaleDateString()}`,
            link: '/employees',
            icon: 'fa-solid fa-clock-rotate-left',
            color: 'blue'
          }));
        }

        if (data.applications) {
          data.applications.forEach((a: any) => items.push({
            type: 'New Application',
            title: a.fullName,
            desc: `New intern application submitted`,
            link: '/interns',
            icon: 'fa-solid fa-user-plus',
            color: 'green'
          }));
        }

        if (data.offboarding) {
          data.offboarding.forEach((o: any) => items.push({
            type: 'Offboarding Request',
            title: o.internName,
            desc: `Pending HR approval for ${o.internId}`,
            link: '/offboarding',
            icon: 'fa-solid fa-user-minus',
            color: 'red'
          }));
        }

        this.notificationItems.set(items);
        this.hasNotifications.set(items.length > 0);
      },
      error: () => {
        this.hasNotifications.set(false);
        this.notificationItems.set([]);
      }
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/' || this.router.url === '/register';
  }

  getGreeting(): string {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  logout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
    this.userRole.set(null);
    this.router.navigate(['/login']);
  }
}
