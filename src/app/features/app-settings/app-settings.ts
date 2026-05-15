import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { 
  PlusSignIcon,
  Delete02Icon,
  Location01Icon,
  MapsLocation02Icon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  Coordinate01Icon,
  MailReceive01Icon,
  UserCircleIcon,
  UserGroupIcon
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
  readonly MapsLocation02Icon = MapsLocation02Icon;
  readonly Settings01Icon = Settings01Icon;
  readonly CheckmarkCircle01Icon = CheckmarkCircle01Icon;
  readonly Coordinate01Icon = Coordinate01Icon;
  readonly MailReceive01Icon = MailReceive01Icon;
  readonly UserCircleIcon = UserCircleIcon;
  readonly UserGroupIcon = UserGroupIcon;

  userRole = signal<string | null>(localStorage.getItem('user_role'));
  currentUser = signal<any>(null);

  receivingEmail = signal<string>('');
  locations = signal<any[]>([]);
  communication = signal<any>({
    emailNotifications: true
  });
  employeeRoles = signal<string[]>([]);
  internRoles = signal<string[]>([]);
  
  activeTab = signal<'locations' | 'communication' | 'employee_roles' | 'intern_roles'>('locations');

  isSaving = signal(false);
  isLoading = signal(true);

  ngOnInit() {
    const data = localStorage.getItem('user_data');
    if (data) {
      this.currentUser.set(JSON.parse(data));
    }
    this.fetchSettings();
  }

  fetchSettings() {
    this.isLoading.set(true);
    this.apiService.getCompanySettings().subscribe({
      next: (res: any) => {
        if (res.success && res.settings) {
          this.receivingEmail.set(res.settings.receivingEmail || '');
          this.locations.set(res.settings.locations || []);
          this.communication.set(res.settings.communication || {
            whatsappNotifications: false,
            emailNotifications: true
          });
          this.employeeRoles.set(res.settings.employeeRoles || []);
          this.internRoles.set(res.settings.internRoles || [
            'Web developer',
            'App developer',
            'Artificial Intelligence',
            'Data Analyst',
            'Cybersecurity Analyst',
            'Networking Analyst',
            'Graphics Designer',
            'Digital marketing',
            'Business developer (Sales)',
            'Research & Development (R&D)',
            'HR Analyst',
            'Other'
          ]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch settings', err);
        this.isLoading.set(false);
      }
    });
  }

  canEditCommunication(): boolean {
    const role = this.userRole()?.toLowerCase();
    return role === 'hr' || role === 'hr_admin';
  }

  canEditLocation(location: any): boolean {
    const role = this.userRole()?.toLowerCase();
    if (role === 'hr' || role === 'hr_admin') return true;
    if (this.userRole() === 'manager') {
      // If it's a new location being added, or one they created
      return !location._id || location.addedBy === this.currentUser()?.employeeId;
    }
    return false;
  }

  addLocation() {
    const current = this.locations();
    current.push({
      name: 'New Branch',
      latitude: 0,
      longitude: 0,
      radius: 200,
      addedBy: (this.userRole()?.toLowerCase() === 'hr' || this.userRole()?.toLowerCase() === 'hr_admin') ? 'hr' : this.currentUser()?.employeeId
    });
    this.locations.set([...current]);
  }

  removeLocation(index: number) {
    const loc = this.locations()[index];
    if (!this.canEditLocation(loc)) {
      alert('You do not have permission to remove this location');
      return;
    }
    const current = this.locations();
    current.splice(index, 1);
    this.locations.set([...current]);
  }

  saveAllSettings() {
    this.isSaving.set(true);
    const payload = {
      receivingEmail: this.receivingEmail(),
      locations: this.locations(),
      communication: this.communication(),
      employeeRoles: this.employeeRoles(),
      internRoles: this.internRoles()
    };

    this.apiService.updateCompanySettings(payload).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: (res: any) => {
        alert('All settings updated successfully');
        this.fetchSettings(); // Refresh to reflect changes immediately
      },
      error: (err) => {
        alert('Failed to update settings: ' + (err.error?.message || err.message));
      }
    });
  }
  
  addRole(type: 'employee' | 'intern') {
    const roles = type === 'employee' ? this.employeeRoles() : this.internRoles();
    roles.push('');
    if (type === 'employee') this.employeeRoles.set([...roles]);
    else this.internRoles.set([...roles]);
  }

  removeRole(type: 'employee' | 'intern', index: number) {
    const roles = type === 'employee' ? this.employeeRoles() : this.internRoles();
    
    // Don't allow deleting 'Other'
    if (roles[index].toLowerCase() === 'other') {
      alert('The "Other" role cannot be deleted as it is required by the system.');
      return;
    }

    roles.splice(index, 1);
    if (type === 'employee') this.employeeRoles.set([...roles]);
    else this.internRoles.set([...roles]);
  }

  updateRole(type: 'employee' | 'intern', index: number, value: string) {
    const roles = type === 'employee' ? this.employeeRoles() : this.internRoles();
    roles[index] = value;
    if (type === 'employee') this.employeeRoles.set([...roles]);
    else this.internRoles.set([...roles]);
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }
}
