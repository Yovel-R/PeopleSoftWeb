import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-intern-attendance',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './intern-attendance.html',
  styleUrl: './intern-attendance.css'
})
export class InternAttendance implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
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
