import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { 
  CheckmarkCircle01Icon,
  SignatureIcon,
  Image01Icon,
  Link01Icon,
  StampIcon
} from '@hugeicons/core-free-icons';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-certificate-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './certificate-settings.html',
  styleUrl: './certificate-settings.css'
})
export class CertificateSettings implements OnInit {
  private apiService = inject(ApiService);

  readonly CheckmarkCircle01Icon = CheckmarkCircle01Icon;
  readonly StampIcon = StampIcon;

  companySettings: any = {
    documentTemplates: {
      offerLetter: { backgroundUrl: '', orientation: 'portrait', placeholders: [] },
      annexure: { backgroundUrl: '', orientation: 'portrait', placeholders: [] },
      nda: { backgroundUrl: '', orientation: 'portrait', placeholders: [] },
      lor: { backgroundUrl: '', orientation: 'landscape', placeholders: [] },
      internshipCompletion: { backgroundUrl: '', orientation: 'landscape', placeholders: [] },
      projectCompletion: { backgroundUrl: '', orientation: 'landscape', placeholders: [] }
    }
  };

  selectedDocType: string = 'offerLetter';

  docCategories = [
    {
      name: 'Onboarding Documents',
      docs: [
        { id: 'offerLetter', label: 'Offer Letter' },
        { id: 'annexure', label: 'Annexure' },
        { id: 'nda', label: 'NDA' }
      ]
    },
    {
      name: 'Offboarding Documents',
      docs: [
        { id: 'lor', label: 'Letter of Recommendation' },
        { id: 'internshipCompletion', label: 'Internship Completion' },
        { id: 'projectCompletion', label: 'Project Completion' }
      ]
    }
  ];

  availablePlaceholderKeys = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'internId', label: 'Intern ID' },
    { key: 'role', label: 'Internship Role' },
    { key: 'onboardingDate', label: 'Onboarding Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'todayDate', label: 'Current Date' },
    { key: 'college', label: 'College/University' },
    { key: 'department', label: 'Department' }
  ];

  isSaving = false;
  isLoading = true;
  draggingIndex: number | null = null;
  dragOffset = { x: 0, y: 0 };

  ngOnInit() {
    this.fetchSettings();
  }

  onMouseDown(event: MouseEvent, index: number) {
    this.draggingIndex = index;
    const p = this.currentTemplate.placeholders[index];
    this.dragOffset.x = event.offsetX;
    this.dragOffset.y = event.offsetY;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggingIndex !== null) {
      const container = event.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      
      // Calculate position relative to container
      let newX = event.clientX - rect.left - this.dragOffset.x;
      let newY = event.clientY - rect.top - this.dragOffset.y;

      // Bounds checking (optional but good for UX)
      newX = Math.max(0, Math.min(newX, 842));
      newY = Math.max(0, Math.min(newY, 595));

      this.currentTemplate.placeholders[this.draggingIndex].x = Math.round(newX);
      this.currentTemplate.placeholders[this.draggingIndex].y = Math.round(newY);
    }
  }

  onMouseUp() {
    this.draggingIndex = null;
  }

  fetchSettings() {
    this.isLoading = true;
    this.apiService.getCompanySettings().subscribe({
      next: (res: any) => {
        if (res.success && res.offerLetterSettings) {
          // Backward compatibility: map existing offerLetterSettings to companySettings
          this.companySettings = {
            ...res.offerLetterSettings,
            documentTemplates: res.offerLetterSettings.documentTemplates || this.companySettings.documentTemplates
          };
          
          // Ensure all templates exist
          const types = ['offerLetter', 'annexure', 'nda', 'lor', 'internshipCompletion', 'projectCompletion'];
          types.forEach(type => {
            if (!this.companySettings.documentTemplates[type]) {
              this.companySettings.documentTemplates[type] = { backgroundUrl: '', placeholders: [] };
            }
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch settings', err);
        this.isLoading = false;
      }
    });
  }

  get currentTemplate() {
    return this.companySettings.documentTemplates[this.selectedDocType];
  }

  addPlaceholder() {
    this.currentTemplate.placeholders.push({
      key: 'fullName',
      x: 100,
      y: 100,
      fontSize: 18,
      isBold: false,
      color: '#000000'
    });
  }

  removePlaceholder(index: number) {
    this.currentTemplate.placeholders.splice(index, 1);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentTemplate.backgroundUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveSettings() {
    this.isSaving = true;
    const payload = {
      offerLetterSettings: this.companySettings
    };

    this.apiService.updateCompanySettings(payload).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (res: any) => {
        alert('All document templates saved successfully');
      },
      error: (err) => {
        alert('Failed to update settings: ' + (err.error?.message || err.message));
      }
    });
  }
}
