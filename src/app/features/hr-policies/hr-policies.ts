import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hr-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-policies.html',
  styleUrl: './hr-policies.css'
})
export class HrPolicies implements OnInit {
  private apiService = inject(ApiService);
  
  policies = signal<any[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  
  newPolicy = {
    policy_name: '',
    policy_url: '',
    policy_view_by: ['employee', 'intern']
  };

  ngOnInit() {
    this.fetchPolicies();
  }

  fetchPolicies() {
    this.isLoading.set(true);
    this.apiService.getPolicies().subscribe({
      next: (data: any[]) => {
        this.policies.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch policies', err);
        this.isLoading.set(false);
      }
    });
  }

  addPolicy() {
    if (!this.newPolicy.policy_name || !this.newPolicy.policy_url) {
      alert('Please fill name and URL');
      return;
    }

    this.isSaving.set(true);
    this.apiService.savePolicy(this.newPolicy).subscribe({
      next: () => {
        this.fetchPolicies();
        this.newPolicy = { policy_name: '', policy_url: '', policy_view_by: ['employee', 'intern'] };
        this.isSaving.set(false);
      },
      error: (err: any) => {
        alert('Failed to save: ' + err.message);
        this.isSaving.set(false);
      }
    });
  }

  deletePolicy(id: string) {
    if (confirm('Delete this policy?')) {
      this.apiService.deletePolicy(id).subscribe({
        next: () => this.fetchPolicies(),
        error: (err: any) => alert('Failed to delete: ' + err.message)
      });
    }
  }

  openPdf(url: string) {
    window.open(url, '_blank');
  }
}
