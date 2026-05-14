import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { AddInvoiceIcon, PolicyIcon, CheckmarkCircle01Icon, ViewIcon, Delete02Icon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-hr-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './hr-policies.html',
  styleUrl: './hr-policies.css'
})
export class HrPolicies implements OnInit {
  private apiService = inject(ApiService);
  
  readonly AddInvoiceIcon = AddInvoiceIcon;
  readonly PolicyIcon = PolicyIcon;
  readonly CheckmarkCircle01Icon = CheckmarkCircle01Icon;
  readonly ViewIcon = ViewIcon;
  readonly Delete02Icon = Delete02Icon;
  
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

  fetchPolicies(isRefresh = false) {
    if (!isRefresh) this.isLoading.set(true);
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
        this.fetchPolicies(true); // Silent refresh
        this.newPolicy = { policy_name: '', policy_url: '', policy_view_by: ['employee', 'intern'] };
        this.isSaving.set(false);
        alert('Policy published successfully');
      },
      error: (err: any) => {
        alert('Failed to save: ' + err.message);
        this.isSaving.set(false);
      }
    });
  }

  toggleVisibility(role: string) {
    const current = this.newPolicy.policy_view_by;
    if (current.includes(role)) {
      this.newPolicy.policy_view_by = current.filter(r => r !== role);
    } else {
      this.newPolicy.policy_view_by = [...current, role];
    }
  }

  isRoleSelected(role: string): boolean {
    return this.newPolicy.policy_view_by.includes(role);
  }

  deletePolicy(id: string) {
    if (confirm('Delete this policy?')) {
      this.apiService.deletePolicy(id).subscribe({
        next: () => {
          this.fetchPolicies(true); // Silent refresh
        },
        error: (err: any) => alert('Failed to delete: ' + err.message)
      });
    }
  }

  openPdf(url: string) {
    window.open(url, '_blank');
  }
}
