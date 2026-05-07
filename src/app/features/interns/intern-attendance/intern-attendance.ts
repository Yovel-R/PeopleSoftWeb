import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InternSidebar } from '../intern-sidebar/intern-sidebar';

@Component({
  selector: 'app-intern-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, InternSidebar],
  templateUrl: './intern-attendance.html',
  styleUrls: ['./intern-attendance.css', '../intern-list/intern-list.css']
})
export class InternAttendance implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  navigateTo(path: string[]) {
    this.router.navigate(path).then(() => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  internId = signal<string>('');
  attendance = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.internId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchAttendance();
  }

  fetchAttendance() {
    console.log('Fetching attendance for internId:', this.internId());
    this.isLoading.set(true);
    this.apiService.getInternAttendance(this.internId()).subscribe({
      next: (data: any) => {
        console.log('Attendance data received:', data);
        this.attendance.set(data.attendance || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch attendance', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'present': return 'status-green';
      case 'absent': return 'status-red';
      case 'half-day': return 'status-orange';
      default: return 'status-gray';
    }
  }
}
