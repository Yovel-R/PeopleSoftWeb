import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-holiday-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './holiday-calendar.html',
  styleUrl: './holiday-calendar.css'
})
export class HolidayCalendar implements OnInit {
  private apiService = inject(ApiService);
  
  holidays = signal<any[]>([]);
  isLoading = signal(true);
  
  // Form fields
  newHoliday = {
    type: 'special',
    fromDate: '',
    toDate: '',
    reason: ''
  };

  ngOnInit() {
    this.fetchHolidays();
  }

  fetchHolidays() {
    this.isLoading.set(true);
    this.apiService.getHolidays().subscribe({
      next: (data: any[]) => {
        // Filter only special holidays for the list
        this.holidays.set(data.filter((h: any) => h.type === 'special'));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch holidays', err);
        this.isLoading.set(false);
      }
    });
  }

  addHoliday() {
    if (!this.newHoliday.fromDate || !this.newHoliday.toDate || !this.newHoliday.reason) {
      alert('Please fill all fields');
      return;
    }

    this.apiService.saveHoliday(this.newHoliday).subscribe({
      next: () => {
        this.fetchHolidays();
        this.newHoliday = { type: 'special', fromDate: '', toDate: '', reason: '' };
      },
      error: (err: any) => alert('Failed to save holiday: ' + err.message)
    });
  }

  deleteHoliday(id: string) {
    if (confirm('Are you sure you want to delete this holiday?')) {
      this.apiService.deleteHoliday(id).subscribe({
        next: () => this.fetchHolidays(),
        error: (err: any) => alert('Failed to delete: ' + err.message)
      });
    }
  }
}
