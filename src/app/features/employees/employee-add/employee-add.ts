import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterModule],
  templateUrl: './employee-add.html',
  styleUrl: './employee-add.css'
})
export class EmployeeAdd {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  isSaving = signal(false);
  
  employee = {
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    onboardingDate: '',
    address: '',
    role: 'Employee'
  };

  saveEmployee() {
    if (!this.employee.fullName || !this.employee.email) {
      alert('Full Name and Email are required');
      return;
    }

    this.isSaving.set(true);
    this.apiService.addEmployee(this.employee).subscribe({
      next: () => {
        alert('Employee added successfully');
        this.router.navigate(['/employees']);
      },
      error: (err: any) => {
        console.error('Failed to add employee', err);
        alert('Failed to add employee: ' + (err.error?.message || err.message));
        this.isSaving.set(false);
      }
    });
  }
}
