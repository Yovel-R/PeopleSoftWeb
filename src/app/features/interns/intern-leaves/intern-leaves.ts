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
        this.leaves.set(data.leaves || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch leaves', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'approved': return 'status-green';
      case 'pending': return 'status-orange';
      case 'rejected': return 'status-red';
      default: return 'status-gray';
    }
  }
}
