import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit {
  private apiService = inject(ApiService);
  
  employees = signal<any[]>([]);
  isLoading = signal(true);
  statusFilter = signal<string>('all');

  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.isLoading.set(true);
    this.apiService.getAllEmployees(this.statusFilter()).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch employees', err);
        this.isLoading.set(false);
      }
    });
  }

  setStatus(status: string) {
    this.statusFilter.set(status);
    this.fetchEmployees();
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'active':
      case 'present':
        return 'status-green';
      case 'on leave':
      case 'pending':
        return 'status-orange';
      case 'terminated':
      case 'resigned':
        return 'status-red';
      default:
        return 'status-gray';
    }
  }
}
