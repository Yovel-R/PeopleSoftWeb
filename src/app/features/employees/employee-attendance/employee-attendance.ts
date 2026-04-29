import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.css'
})
export class EmployeeAttendance implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  employeeId = signal<string>('');
  attendance = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.employeeId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchAttendance();
  }

  fetchAttendance() {
    this.isLoading.set(true);
    this.apiService.getEmployeeAttendance(this.employeeId()).subscribe({
      next: (data: any) => {
        console.log('Employee attendance data received:', data);
        // Assuming backend returns { attendance: [] } or similar wrapped object
        this.attendance.set(data.attendance || data.data || (Array.isArray(data) ? data : []));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch employee attendance', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'present': return 'status-green';
      case 'absent': return 'status-red';
      case 'on leave': return 'status-orange';
      default: return 'status-gray';
    }
  }
}
