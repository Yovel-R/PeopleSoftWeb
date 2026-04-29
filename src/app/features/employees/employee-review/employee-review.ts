import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-review',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './employee-review.html',
  styleUrl: './employee-review.css'
})
export class EmployeeReview implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  employeeId = signal<string>('');
  reviews = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.employeeId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchReviews();
  }

  fetchReviews() {
    this.isLoading.set(true);
    this.apiService.getEmployeeReview(this.employeeId()).subscribe({
      next: (data: any[]) => {
        console.log('Employee reviews received:', data);
        this.reviews.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch employee reviews', err);
        this.isLoading.set(false);
      }
    });
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'status-green';
    if (rating >= 3.5) return 'status-teal';
    if (rating >= 2.5) return 'status-orange';
    return 'status-red';
  }
}
