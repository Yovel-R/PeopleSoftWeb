import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { 
  Calendar01Icon,
  CalendarCheckOut01Icon,
  FingerAccessIcon,
  UserCircleIcon,
  StudentsIcon,
  WorkflowSquare03Icon,
  Home01Icon,
  Chat01Icon,
  PlusSignIcon,
  Delete01Icon,
  FilterIcon,
  Money03Icon,
  LicenseDraftIcon
} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HugeiconsIconComponent, RouterModule],
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

  // Icons
  readonly Calendar01Icon = Calendar01Icon;
  readonly CalendarCheckOut01Icon = CalendarCheckOut01Icon;
  readonly FingerAccessIcon = FingerAccessIcon;
  readonly UserCircleIcon = UserCircleIcon;
  readonly StudentsIcon = StudentsIcon;
  readonly WorkflowSquare03Icon = WorkflowSquare03Icon;
  readonly Home01Icon = Home01Icon;
  readonly Chat01Icon = Chat01Icon;
  readonly PlusSignIcon = PlusSignIcon;
  readonly Delete01Icon = Delete01Icon;
  readonly FilterIcon = FilterIcon;
  readonly Money03Icon = Money03Icon;
  readonly LicenseDraftIcon = LicenseDraftIcon;

  currentTime = signal<Date>(new Date());

  ngOnInit() {
    this.fetchStats();
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
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
