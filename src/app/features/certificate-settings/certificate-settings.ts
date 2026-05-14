import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { CheckmarkCircle01Icon, DiplomaIcon, OrientationLandscapeToPotraitIcon, OrientationPotraitToLandscapeIcon } from '@hugeicons/core-free-icons';
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
  private cdr = inject(ChangeDetectorRef);

  readonly CheckmarkCircle01Icon = CheckmarkCircle01Icon;
  readonly DiplomaIcon = DiplomaIcon;
  readonly OrientationLandscapeToPotraitIcon = OrientationLandscapeToPotraitIcon;
  readonly OrientationPotraitToLandscapeIcon = OrientationPotraitToLandscapeIcon;

  /** A page within a template */
  defaultPage() {
    return { backgroundUrl: '', placeholders: [] };
  }

  /** Default template structure using pages array */
  defaultTemplate(orientation = 'portrait') {
    return { orientation, pages: [this.defaultPage()] };
  }

  documentTemplates: any = {
    offerLetter:          this.defaultTemplate('portrait'),
    annexure:             this.defaultTemplate('portrait'),
    nda:                  this.defaultTemplate('portrait'),
    lor:                  this.defaultTemplate('landscape'),
    internshipCompletion: this.defaultTemplate('landscape'),
    projectCompletion:    this.defaultTemplate('landscape')
  };

  otherSettings: any = {};
  selectedDocType: string = 'offerLetter';
  selectedPageIndex: number = 0;   // which page is active in the builder
  isLoading = true;
  isSaving = false;

  draggingIndex: number | null = null;
  dragOffset = { x: 0, y: 0 };

  docCategories = [
    {
      name: 'Onboarding Documents',
      docs: [
        { id: 'offerLetter', label: 'Offer Letter' },
        { id: 'annexure',    label: 'Annexure' },
        { id: 'nda',         label: 'NDA' }
      ]
    },
    {
      name: 'Offboarding Documents',
      docs: [
        { id: 'lor',                  label: 'Letter of Recommendation' },
        { id: 'internshipCompletion', label: 'Internship Completion' },
        { id: 'projectCompletion',    label: 'Project Completion' }
      ]
    }
  ];

  availablePlaceholderKeys = [
    { key: 'fullName',       label: 'Full Name' },
    { key: 'internId',       label: 'Intern ID' },
    { key: 'role',           label: 'Internship Role' },
    { key: 'onboardingDate', label: 'Onboarding Date' },
    { key: 'endDate',        label: 'End Date' },
    { key: 'todayDate',      label: 'Current Date' },
    { key: 'college',        label: 'College/University' },
    { key: 'department',     label: 'Department' }
  ];

  ngOnInit() {
    this.fetchSettings();
  }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  fetchSettings() {
    this.isLoading = true;
    this.apiService.getCompanySettings().subscribe({
      next: (res: any) => {
        if (res.success && res.offerLetterSettings) {
          const saved = res.offerLetterSettings.documentTemplates || {};
          const types = Object.keys(this.documentTemplates);

          types.forEach(type => {
            if (saved[type]) {
              const s = saved[type];

              // Migrate old format (single backgroundUrl) → pages array
              if (s.pages && s.pages.length > 0) {
                this.documentTemplates[type] = {
                  orientation: s.orientation || this.documentTemplates[type].orientation,
                  pages: s.pages
                };
              } else if (s.backgroundUrl !== undefined) {
                // Legacy single-page format
                this.documentTemplates[type] = {
                  orientation: s.orientation || this.documentTemplates[type].orientation,
                  pages: [{ backgroundUrl: s.backgroundUrl || '', placeholders: s.placeholders || [] }]
                };
              }
            }
          });

          const { documentTemplates: _ignored, ...rest } = res.offerLetterSettings;
          this.otherSettings = rest;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch settings', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Template helpers ───────────────────────────────────────────────────────
  get currentTemplate() {
    return this.documentTemplates[this.selectedDocType]
      || this.defaultTemplate();
  }

  get currentPage() {
    const t = this.currentTemplate;
    return t.pages?.[this.selectedPageIndex] || this.defaultPage();
  }

  selectDoc(docId: string) {
    this.selectedDocType = docId;
    this.selectedPageIndex = 0;   // reset to first page
    this.draggingIndex = null;
  }

  // ── Page management ────────────────────────────────────────────────────────
  addPage() {
    this.currentTemplate.pages.push(this.defaultPage());
    this.selectedPageIndex = this.currentTemplate.pages.length - 1;
  }

  removePage(index: number) {
    if (this.currentTemplate.pages.length === 1) return; // keep at least 1
    this.currentTemplate.pages.splice(index, 1);
    if (this.selectedPageIndex >= this.currentTemplate.pages.length) {
      this.selectedPageIndex = this.currentTemplate.pages.length - 1;
    }
  }

  // ── File upload (for current page background) ──────────────────────────────
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size exceeds 5MB limit.'); return; }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentPage.backgroundUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── Mouse drag ─────────────────────────────────────────────────────────────
  onMouseDown(event: MouseEvent, index: number) {
    this.draggingIndex = index;
    this.dragOffset.x = event.offsetX;
    this.dragOffset.y = event.offsetY;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggingIndex === null) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(event.clientX - rect.left - this.dragOffset.x, 842)));
    const y = Math.round(Math.max(0, Math.min(event.clientY - rect.top  - this.dragOffset.y, 595)));
    this.currentPage.placeholders[this.draggingIndex].x = x;
    this.currentPage.placeholders[this.draggingIndex].y = y;
  }

  onMouseUp() { this.draggingIndex = null; }

  // ── Placeholders ───────────────────────────────────────────────────────────
  addPlaceholder() {
    this.currentPage.placeholders.push({
      key: 'fullName', x: 100, y: 100, fontSize: 18, isBold: false, color: '#000000'
    });
  }

  removePlaceholder(index: number) {
    this.currentPage.placeholders.splice(index, 1);
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  saveSettings() {
    this.isSaving = true;
    const payload = {
      offerLetterSettings: {
        ...this.otherSettings,
        documentTemplates: this.documentTemplates
      }
    };

    this.apiService.updateCompanySettings(payload).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => alert('All document templates saved successfully'),
      error: (err) => alert('Failed to update settings: ' + (err.error?.message || err.message))
    });
  }
}
