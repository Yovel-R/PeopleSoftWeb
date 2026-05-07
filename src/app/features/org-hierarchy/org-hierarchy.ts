import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { WorkflowSquare03Icon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-org-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './org-hierarchy.html',
  styleUrl: './org-hierarchy.css'
})
export class OrgHierarchy implements OnInit {
  private apiService = inject(ApiService);
  readonly WorkflowSquare03Icon = WorkflowSquare03Icon;
  
  hierarchyUrl: string = '';
  publishedUrl = signal('');
  userEmail: string = '';
  isLoading = signal(true);
  isSaving = signal(false);

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    this.userEmail = userData.email || 'admin@softrate.com';
    this.fetchHierarchy();
  }

  fetchHierarchy() {
    this.isLoading.set(true);
    this.apiService.getOrgHierarchy(this.userEmail).subscribe({
      next: (data: any) => {
        if (data.success && data.policy_url) {
          this.hierarchyUrl = data.policy_url;
          this.publishedUrl.set(data.policy_url);
          this.isLoading.set(false);
        } else {
          this.fetchGlobalHierarchy();
        }
      },
      error: () => this.fetchGlobalHierarchy()
    });
  }

  fetchGlobalHierarchy() {
    this.apiService.getGlobalPolicyUrl().subscribe({
      next: (data: any) => {
        if (data.success && data.policy_url) {
          this.hierarchyUrl = data.policy_url;
          this.publishedUrl.set(data.policy_url);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch global hierarchy', err);
        this.isLoading.set(false);
      }
    });
  }

  saveHierarchy() {
    if (!this.hierarchyUrl) {
      alert('Please enter a URL');
      return;
    }

    this.isSaving.set(true);
    this.apiService.saveOrgHierarchy(this.hierarchyUrl, this.userEmail).subscribe({
      next: () => {
        this.publishedUrl.set(this.hierarchyUrl);
        alert('Hierarchy URL saved and published successfully');
        this.isSaving.set(false);
      },
      error: (err: any) => {
        alert('Failed to save: ' + (err.error?.msg || err.message));
        this.isSaving.set(false);
      }
    });
  }

  viewHierarchy() {
    if (this.publishedUrl()) {
      window.open(this.publishedUrl(), '_blank');
    }
  }
}
