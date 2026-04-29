import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-intern-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './intern-details.html',
  styleUrl: './intern-details.css',
})
export class InternDetails implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  internId = signal<string>('');
  intern = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.internId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchDetails();
  }

  fetchDetails() {
    this.isLoading.set(true);
    this.apiService.getInternById(this.internId()).subscribe({
      next: (data) => {
        console.log('Intern details received:', data);
        this.intern.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch intern details', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active': return 'status-green';
      case 'initial': return 'status-blue';
      case 'completed': return 'status-teal';
      default: return 'status-gray';
    }
  }
}
