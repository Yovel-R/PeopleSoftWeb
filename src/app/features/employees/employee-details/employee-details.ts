import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css',
})
export class EmployeeDetails implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  employeeId = signal<string>('');
  employee = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.employeeId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchDetails();
  }

  fetchDetails() {
    this.isLoading.set(true);
    this.apiService.getEmployeeById(this.employeeId()).subscribe({
      next: (data) => {
        console.log('Employee details received:', data);
        this.employee.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch employee details', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active': return 'status-green';
      case 'on leave': return 'status-orange';
      case 'terminated': return 'status-red';
      default: return 'status-gray';
    }
  }
}
