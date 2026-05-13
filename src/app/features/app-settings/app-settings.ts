import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { 
  PlusSignIcon,
  Delete02Icon,
  Location01Icon,
  Settings01Icon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './app-settings.html',
  styleUrl: './app-settings.css'
})
export class AppSettings implements OnInit {
  private apiService = inject(ApiService);

  readonly PlusSignIcon = PlusSignIcon;
  readonly Delete02Icon = Delete02Icon;
  readonly Location01Icon = Location01Icon;
  readonly Settings01Icon = Settings01Icon;
  readonly CheckmarkCircle01Icon = CheckmarkCircle01Icon;

  receivingEmail: string = '';
  locations: any[] = [];
  communication: any = {
    whatsappNotifications: false,
    emailNotifications: true
  };

  isSaving = false;
  isLoading = true;

  ngOnInit() {
    this.fetchSettings();
  }

  fetchSettings() {
    this.isLoading = true;
    this.apiService.getCompanySettings().subscribe({
      next: (res: any) => {
        if (res.success && res.settings) {
          this.receivingEmail = res.settings.receivingEmail || '';
          this.locations = res.settings.locations || [];
          this.communication = res.settings.communication || {
            whatsappNotifications: false,
            emailNotifications: true
          };
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch settings', err);
        this.isLoading = false;
      }
    });
  }

  addLocation() {
    this.locations.push({
      name: 'New Branch',
      latitude: 0,
      longitude: 0,
      radius: 200
    });
  }

  removeLocation(index: number) {
    this.locations.splice(index, 1);
  }

  saveAllSettings() {
    this.isSaving = true;
    const payload = {
      receivingEmail: this.receivingEmail,
      locations: this.locations,
      communication: this.communication
    };

    this.apiService.updateCompanySettings(payload).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (res: any) => {
        alert('All settings updated successfully');
      },
      error: (err) => {
        alert('Failed to update settings: ' + (err.error?.message || err.message));
      }
    });
  }
}
