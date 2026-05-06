import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { RouterModule } from '@angular/router';

import { InternRequests } from '../intern-requests/intern-requests';
import { LeaveManagement } from '../../leaves/leave-management/leave-management';
import { AttendanceCorrections } from '../attendance-corrections/attendance-corrections';

@Component({
  selector: 'app-intern-list',
  standalone: true,
  imports: [CommonModule, RouterModule, InternRequests, LeaveManagement, AttendanceCorrections],
  templateUrl: './intern-list.html',
  styleUrl: './intern-list.css'
})
export class InternList implements OnInit {
  private apiService = inject(ApiService);
  
  currentTab = signal<'list' | 'leaves' | 'requests' | 'corrections'>('list');
  interns = signal<any[]>([]);
  isLoading = signal(true);
  statusFilter = signal<string>('all');
  rangeFilter = signal<string>('thisMonth');

  ngOnInit() {
    this.fetchInterns();
  }

  fetchInterns() {
    this.isLoading.set(true);
    this.apiService.getAllActiveInterns(this.rangeFilter(), this.statusFilter()).subscribe({
      next: (data) => {
        this.interns.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch interns', err);
        this.isLoading.set(false);
      }
    });
  }

  setFilter(range: string) {
    this.rangeFilter.set(range);
    this.fetchInterns();
  }

  setStatus(status: string) {
    this.statusFilter.set(status);
    this.fetchInterns();
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'approved':
      case 'accepted':
      case 'active':
        return 'status-green';
      case 'ongoing':
        return 'status-teal';
      case 'drop':
      case 'rejected':
      case 'terminated':
        return 'status-red';
      case 'pending':
      case 'initial':
        return 'status-orange';
      default:
        return 'status-gray';
    }
  }

  exportInternData() {
    const baseUrl = this.apiService.getBaseUrl();
    const url = `${baseUrl}/api/intern/export/excel?status=${this.statusFilter()}&range=${this.rangeFilter()}`;
    window.open(url, '_blank');
  }
}
