import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard implements OnInit {
  private apiService = inject(ApiService);
  
  employeeData = signal<any>(null);
  currentTime = signal(new Date());
  pendingTeamRequests = signal<any[]>([]);

  isManager = computed(() => this.employeeData()?.isManager === true);

  ngOnInit() {
    const data = localStorage.getItem('user_data');
    if (data) {
      const parsedData = JSON.parse(data);
      this.employeeData.set(parsedData);
      
      if (parsedData.isManager) {
        this.fetchTeamRequests();
      }
    }

    // Update clock
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  fetchTeamRequests() {
    this.apiService.getAssignedInterns(this.employeeData()._id).subscribe({
      next: (data) => {
        // Filter only those that haven't been reviewed by this manager yet
        this.pendingTeamRequests.set(data.filter(r => r.managerApprovalStatus === 'pending'));
      },
      error: (err) => console.error('Failed to fetch team requests', err)
    });
  }

  reviewRequest(internId: string, status: 'approved' | 'rejected') {
    const remarks = prompt(`Enter remarks for ${status}:`) || '';
    this.apiService.managerReviewIntern(internId, status, remarks).subscribe({
      next: () => {
        alert(`Request ${status} successfully`);
        this.fetchTeamRequests();
      },
      error: (err) => alert('Action failed')
    });
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
