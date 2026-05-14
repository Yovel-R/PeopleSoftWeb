import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { UserCircleIcon, FingerAccessIcon, CalendarCheckOut01Icon, LicenseDraftIcon, Money03Icon, Location01Icon, FileDownloadIcon } from '@hugeicons/core-free-icons';
import { EmployeeSidebar } from '../employee-sidebar/employee-sidebar';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, HugeiconsIconComponent, RouterModule, EmployeeSidebar],
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.css'
})
export class EmployeeAttendance implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly UserCircleIcon = UserCircleIcon;
  readonly FingerAccessIcon = FingerAccessIcon;
  readonly CalendarCheckOut01Icon = CalendarCheckOut01Icon;
  readonly LicenseDraftIcon = LicenseDraftIcon;
  readonly Money03Icon = Money03Icon;
  readonly Location01Icon = Location01Icon;
  readonly FileDownloadIcon = FileDownloadIcon;

  exportAttendance() {
    const from = prompt('Enter start date (YYYY-MM-DD):', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const to = prompt('Enter end date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    
    if (!from || !to) return;

    const url = `${this.apiService.getBaseUrl()}/api/attendance/export/pdf/${this.employeeId()}?from=${from}&to=${to}`;
    
    this.apiService.downloadFile(url).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Attendance_${this.employeeId()}.pdf`;
        link.click();
      },
      error: (err) => console.error('Export failed', err)
    });
  }

  openMap(locationStr: string) {
    if (locationStr) {
      window.open(`https://www.google.com/maps?q=${locationStr}`, '_blank');
    } else {
      alert('Location not available for this record');
    }
  }

  navigateTo(path: string[]) {
    this.router.navigate(path).then(() => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  
  employeeId = signal<string>('');
  attendance = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.employeeId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchAttendance();
  }

  fetchAttendance() {
    this.isLoading.set(true);
    this.apiService.getEmployeeAttendance(this.employeeId()).subscribe({
      next: (data: any) => {
        console.log('Employee attendance data received:', data);
        // Assuming backend returns { attendance: [] } or similar wrapped object
        this.attendance.set(data.attendance || data.data || (Array.isArray(data) ? data : []));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch employee attendance', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'present': return 'status-green';
      case 'absent': return 'status-red';
      case 'on leave': return 'status-orange';
      default: return 'status-gray';
    }
  }
}
