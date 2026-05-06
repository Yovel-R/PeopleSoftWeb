import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-add.html',
  styleUrl: './employee-add.css'
})
export class EmployeeAdd implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  
  isSaving = signal(false);
  isApprovalMode = signal(false);
  requestId = '';
  
  employee = {
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    onboardingDate: '',
    address: '',
    role: 'Employee'
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isApprovalMode.set(true);
      this.requestId = id;
      this.fetchRequestData(id);
    }
  }

  fetchRequestData(id: string) {
    this.apiService.getEmployeeById(id).subscribe({
      next: (data) => {
        console.log('Fetched employee data:', data);
        this.employee.fullName = data.fullName || '';
        this.employee.email = data.email || '';
        this.employee.phone = data.phone || '';
        this.employee.department = data.department || '';
        this.employee.designation = data.designation || '';
        this.employee.address = data.address || '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch request data', err);
        alert('Failed to load application data');
      }
    });
  }

  saveEmployee() {
    if (!this.employee.fullName || !this.employee.email || !this.employee.onboardingDate) {
      alert('Full Name, Email, and Onboarding Date are required');
      return;
    }

    this.isSaving.set(true);

    if (this.isApprovalMode()) {
      this.apiService.acceptEmployee(this.requestId, this.employee).subscribe({
        next: () => {
          alert('Employee onboarding started!');
          this.router.navigate(['/employees/requests']);
        },
        error: (err: any) => {
          console.error('Failed to approve employee', err);
          alert('Failed to approve: ' + (err.error?.message || err.message));
          this.isSaving.set(false);
        }
      });
    } else {
      this.apiService.addEmployee(this.employee).subscribe({
        next: () => {
          alert('Employee added successfully');
          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          console.error('Failed to add employee', err);
          alert('Failed to add: ' + (err.error?.message || err.message));
          this.isSaving.set(false);
        }
      });
    }
  }
}
