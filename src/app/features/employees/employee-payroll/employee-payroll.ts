import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-payroll',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './employee-payroll.html',
  styleUrl: './employee-payroll.css'
})
export class EmployeePayroll implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  employeeId = signal<string>('');
  employee = signal<any>(null);
  isLoading = signal(true);
  
  // Mock payroll data
  payrollStats = {
    grossSalary: '₹ 45,000',
    netSalary: '₹ 41,200',
    deductions: '₹ 3,800',
    tax: '₹ 1,200'
  };

  salaryHistory = [
    { month: 'March 2024', status: 'Paid', amount: '₹ 41,200', date: '01 Mar 2024' },
    { month: 'February 2024', status: 'Paid', amount: '₹ 41,200', date: '01 Feb 2024' },
    { month: 'January 2024', status: 'Paid', amount: '₹ 41,200', date: '01 Jan 2024' }
  ];

  ngOnInit() {
    this.employeeId.set(this.route.snapshot.paramMap.get('id') || '');
    this.fetchEmployee();
  }

  fetchEmployee() {
    this.isLoading.set(true);
    this.apiService.getEmployeeById(this.employeeId()).subscribe({
      next: (data) => {
        this.employee.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to fetch employee', err);
        this.isLoading.set(false);
      }
    });
  }

  downloadPayslip(month: string) {
    alert(`Downloading payslip for ${month}...`);
  }
}
