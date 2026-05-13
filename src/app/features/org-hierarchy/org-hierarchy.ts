import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { DashboardSquare01Icon, Mail01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-org-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './org-hierarchy.html',
  styleUrl: './org-hierarchy.css'
})
export class OrgHierarchy implements OnInit {
  private apiService = inject(ApiService);
  readonly DashboardSquare01Icon = DashboardSquare01Icon;
  readonly Mail01Icon = Mail01Icon;
  readonly Settings01Icon = Settings01Icon;
  
  hierarchyUrl: string = '';
  publishedUrl = signal('');
  
  userEmail: string = '';
  isLoading = signal(true);
  isSaving = signal(false);

  ngOnInit() {
    const rawData = localStorage.getItem('user_data');
    let userData: any = {};
    if (rawData && rawData !== 'undefined') {
      try {
        userData = JSON.parse(rawData);
      } catch (e) {
        console.error('Failed to parse user_data', e);
      }
    }
    this.userEmail = userData.email || 'admin@gmail.com';
    this.fetchHierarchy();
  }

  fetchHierarchy() {
    this.isLoading.set(true);
    this.apiService.getOrgHierarchy(this.userEmail).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data: any) => {
        if (data.success && data.policy_url) {
          this.hierarchyUrl = data.policy_url;
          this.publishedUrl.set(data.policy_url);
        } else {
          this.fetchGlobalHierarchy();
        }
      },
      error: () => this.fetchGlobalHierarchy()
    });
  }

  fetchGlobalHierarchy() {
    this.isLoading.set(true);
    this.apiService.getGlobalPolicyUrl().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data: any) => {
        if (data.success && data.policy_url) {
          this.hierarchyUrl = data.policy_url;
          this.publishedUrl.set(data.policy_url);
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch global hierarchy', err);
      }
    });
  }

  saveHierarchy() {
    if (!this.hierarchyUrl) {
      alert('Please enter a URL');
      return;
    }

    this.isSaving.set(true);
    this.apiService.saveOrgHierarchy(this.hierarchyUrl, this.userEmail).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.publishedUrl.set(this.hierarchyUrl);
        alert('Hierarchy URL saved and published successfully');
      },
      error: (err: any) => {
        alert('Failed to save: ' + (err.error?.msg || err.message));
      }
    });
  }

  viewHierarchy() {
    if (this.publishedUrl()) {
      window.open(this.publishedUrl(), '_blank');
    }
  }
}
