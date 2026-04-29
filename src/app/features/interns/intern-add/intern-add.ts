import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-intern-add',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterModule],
  templateUrl: './intern-add.html',
  styleUrl: './intern-add.css'
})
export class InternAdd {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  isSaving = signal(false);
  
  intern = {
    fullName: '',
    email: '',
    contact: '',
    college: '',
    department: '',
    role: '',
    onboardingDate: '',
    internshipType: 'Stipend',
    applicationType: 'Internship'
  };

  saveIntern() {
    if (!this.intern.fullName || !this.intern.email) {
      alert('Full Name and Email are required');
      return;
    }

    this.isSaving.set(true);
    // Note: The backend /api/intern/add expects multipart/form-data if resume is present,
    // but here we'll send JSON for now as a simplified version.
    // If the backend strictly needs multipart, we might need to adjust.
    this.apiService.addIntern(this.intern).subscribe({
      next: () => {
        alert('Intern added successfully');
        this.router.navigate(['/interns']);
      },
      error: (err: any) => {
        console.error('Failed to add intern', err);
        alert('Failed to add intern: ' + (err.error?.message || err.message));
        this.isSaving.set(false);
      }
    });
  }
}
