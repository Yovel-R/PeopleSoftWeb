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
  
  // Regular Holidays
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  weeks = [
    { id: 1, label: "1st Week" },
    { id: 2, label: "2nd Week" },
    { id: 3, label: "3rd Week" },
    { id: 4, label: "4th Week" },
    { id: 5, label: "5th Week" }
  ];
  
  selectedDay = signal<string | null>(null);
  selectedWeeks = signal<number[]>([]);
  weeklyHolidaysMap = signal<Record<string, number[]>>({});
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
        // Special holidays
        this.holidays.set(data.filter((h: any) => h.type === 'special'));
        
        // Weekly holidays mapping
        const weeklyMap: Record<string, number[]> = {};
        data.filter((h: any) => h.type === 'weekly').forEach(h => {
          weeklyMap[h.day] = h.weeks;
        });
        this.weeklyHolidaysMap.set(weeklyMap);
        
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch holidays', err);
        this.isLoading.set(false);
      }
    });
  }

  selectDay(day: string) {
    this.selectedDay.set(day);
    this.selectedWeeks.set(this.weeklyHolidaysMap()[day] || []);
  }

  toggleWeek(weekId: number) {
    const current = [...this.selectedWeeks()];
    const index = current.indexOf(weekId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(weekId);
    }
    this.selectedWeeks.set(current);
  }

  saveWeeklyHoliday() {
    const day = this.selectedDay();
    if (!day) return;

    this.apiService.saveHoliday({
      type: 'weekly',
      day: day,
      weeks: this.selectedWeeks()
    }).subscribe({
      next: () => {
        alert('Weekly holiday updated');
        this.fetchHolidays();
      },
      error: (err: any) => alert('Failed to update weekly holiday: ' + err.message)
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
