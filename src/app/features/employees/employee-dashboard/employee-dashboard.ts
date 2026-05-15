import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
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
  LicenseDraftIcon,
  File02Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HugeiconsIconComponent],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard implements OnInit {
  private apiService = inject(ApiService);
  
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
  readonly File02Icon = File02Icon;
  readonly Clock01Icon = Clock01Icon;

  employeeData = signal<any>(null);
  currentTime = signal(new Date());
  pendingTeamRequests = signal<any[]>([]);

  isManager = computed(() => this.employeeData()?.isManager === true);

  ngOnInit() {
    const data = localStorage.getItem('user_data');
    if (data) {
      const parsedData = JSON.parse(data);
      this.employeeData.set(parsedData);
      
      if (parsedData.isManager) {
        this.fetchTeamRequests();
      }
    }

    // Update clock
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  fetchTeamRequests() {
    this.apiService.getAssignedInterns(this.employeeData()._id).subscribe({
      next: (data) => {
        // Filter only those that haven't been reviewed by this manager yet
        this.pendingTeamRequests.set(data.filter(r => r.managerApprovalStatus === 'pending'));
      },
      error: (err) => console.error('Failed to fetch team requests', err)
    });
  }

  reviewRequest(internId: string, status: 'approved' | 'rejected') {
    const remarks = prompt(`Enter remarks for ${status}:`) || '';
    this.apiService.managerReviewIntern(internId, status, remarks).subscribe({
      next: () => {
        alert(`Request ${status} successfully`);
        this.fetchTeamRequests();
      },
      error: (err) => alert('Action failed')
    });
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
