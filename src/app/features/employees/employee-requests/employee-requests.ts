import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-requests.html',
  styleUrl: './employee-requests.css'
})
export class EmployeeRequests implements OnInit {
  private apiService = inject(ApiService);
  
  requests = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchRequests();
  }

  fetchRequests() {
    this.isLoading.set(true);
    // Passing 'initial' to the active employees endpoint
    this.apiService.getAllEmployees('all', 'initial').subscribe({
      next: (data) => {
        this.requests.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch employee requests', err);
        this.isLoading.set(false);
      }
    });
  }

  rejectRequest(id: string) {
    if (!confirm('Are you sure you want to reject this application?')) return;
    
    this.apiService.deleteEmployee(id).subscribe({
      next: () => {
        this.requests.update((all: any[]) => all.filter((r: any) => r._id !== id));
      },
      error: (err) => {
        console.error('Failed to reject request', err);
        alert('Failed to reject application');
      }
    });
  }
}
