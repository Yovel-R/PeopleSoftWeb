import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-org-hierarchy',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './org-hierarchy.html',
  styleUrl: './org-hierarchy.css'
})
export class OrgHierarchy implements OnInit {
  private apiService = inject(ApiService);
  
  hierarchyUrl: string = '';
  isLoading = signal(true);
  isSaving = signal(false);

  ngOnInit() {
    this.fetchHierarchy();
  }

  fetchHierarchy() {
    this.isLoading.set(true);
    this.apiService.getOrgHierarchy().subscribe({
      next: (data: any) => {
        if (data.success && data.policy_url) {
          this.hierarchyUrl = data.policy_url;
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch hierarchy', err);
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
    this.apiService.saveOrgHierarchy(this.hierarchyUrl).subscribe({
      next: () => {
        alert('Hierarchy URL saved successfully');
        this.isSaving.set(false);
      },
      error: (err: any) => {
        alert('Failed to save: ' + err.message);
        this.isSaving.set(false);
      }
    });
  }

  viewHierarchy() {
    if (this.hierarchyUrl) {
      window.open(this.hierarchyUrl, '_blank');
    }
  }
}
