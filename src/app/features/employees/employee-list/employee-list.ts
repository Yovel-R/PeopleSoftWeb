import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { RouterModule } from '@angular/router';

import { EmployeeRequests } from '../employee-requests/employee-requests';
import { LeaveManagement } from '../../leaves/leave-management/leave-management';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, EmployeeRequests, LeaveManagement],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit {
  private apiService = inject(ApiService);
  
  currentTab = signal<'list' | 'leaves' | 'requests'>('list');
  employees = signal<any[]>([]);
  isLoading = signal(true);
  statusFilter = signal<string>('all');

  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.isLoading.set(true);
    console.log('Using Base URL:', this.apiService.getBaseUrl());
    console.log('Fetching employees with status:', this.statusFilter());
    this.apiService.getAllEmployees(this.statusFilter()).subscribe({
      next: (data) => {
        console.log('Employees received:', data);
        this.employees.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch employees', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleManager(emp: any) {
    this.apiService.toggleManager(emp._id).subscribe({
      next: (res) => {
        // Immutable update to trigger signal refresh
        this.employees.update(prev => 
          prev.map(e => e._id === emp._id ? { ...e, isManager: res.isManager } : e)
        );
      },
      error: (err) => {
        console.error('Failed to toggle manager status', err);
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
