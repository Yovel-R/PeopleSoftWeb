import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private apiService = inject(ApiService);
  
  selectedModel = signal<'interns' | 'employees'>('interns');
  isLoading = signal(true);

  stats = signal<any>({
    interns: [],
    employees: []
  });

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.isLoading.set(true);
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch stats', err);
        this.isLoading.set(false);
      }
    });
  }

  selectModel(model: 'interns' | 'employees') {
    this.selectedModel.set(model);
  }
}
