import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-intern-leaves',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './intern-leaves.html',
  styleUrl: './intern-leaves.css'
})
export class InternLeaves implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  internId = signal<string>('');
  leaves = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.internId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchLeaves();
  }

  fetchLeaves() {
    console.log('Fetching leaves for internId:', this.internId());
    this.isLoading.set(true);
    this.apiService.getInternLeaves(this.internId()).subscribe({
      next: (data: any) => {
        console.log('Leaves data received:', data);
        this.leaves.set(Array.isArray(data) ? data : (data.leaves || []));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch leaves', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(hrStatus: string, managerStatus: string): string {
    const hr = hrStatus?.toLowerCase();
    const mgr = managerStatus?.toLowerCase();

    if (hr === 'accepted') return 'status-green';
    if (hr === 'rejected' || mgr === 'rejected') return 'status-red';
    return 'status-orange';
  }

  getStatusLabel(hrStatus: string, managerStatus: string): string {
    const hr = hrStatus?.toLowerCase();
    const mgr = managerStatus?.toLowerCase();

    if (hr === 'accepted') return 'Approved';
    if (hr === 'rejected') return 'Rejected by HR';
    if (mgr === 'rejected') return 'Rejected by Manager';
    if (mgr === 'accepted') return 'Awaiting HR';
    return 'Awaiting Manager';
  }
}
