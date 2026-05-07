import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { FingerAccessIcon, CalendarCheckOut01Icon, LicenseDraftIcon, UserCircleIcon } from '@hugeicons/core-free-icons';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InternSidebar } from '../intern-sidebar/intern-sidebar';

@Component({
  selector: 'app-intern-details',
  standalone: true,
  imports: [CommonModule, RouterModule, InternSidebar, HugeiconsIconComponent],
  templateUrl: './intern-details.html',
  styleUrls: ['./intern-details.css', '../intern-list/intern-list.css'],
})
export class InternDetails implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly FingerAccessIcon = FingerAccessIcon;
  readonly CalendarCheckOut01Icon = CalendarCheckOut01Icon;
  readonly LicenseDraftIcon = LicenseDraftIcon;
  readonly UserCircleIcon = UserCircleIcon;

  internId = signal<string>('');
  intern = signal<any>(null);
  isLoading = signal(true);

  navigateTo(path: string[]) {
    this.router.navigate(path).then(() => {
      // Scroll the main content area to top after navigation
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

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
