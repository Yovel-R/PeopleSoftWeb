import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { App } from '../../../app';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private app = inject(App);

  loginType = signal<'hr' | 'employee'>('hr');
  isLoading = signal(false);
  errorMessage = signal('');

  credentials = {
    email: '',
    employeeId: '',
    password: ''
  };

  setLoginType(type: 'hr' | 'employee') {
    this.loginType.set(type);
    this.errorMessage.set('');
  }

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.loginType() === 'hr') {
      this.apiService.hrLogin(this.credentials.email, this.credentials.password).subscribe({
        next: (res) => {
          localStorage.setItem('user_role', 'hr');
          localStorage.setItem('user_data', JSON.stringify(res.hr));
          this.app.userRole.set('hr');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Login failed');
          this.isLoading.set(false);
        }
      });
    } else {
      this.apiService.employeeLogin(this.credentials.employeeId, this.credentials.password).subscribe({
        next: (res) => {
          localStorage.setItem('user_role', 'employee');
          localStorage.setItem('user_data', JSON.stringify(res.employee));
          this.app.userRole.set('employee');
          this.router.navigate(['/employee/dashboard']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Login failed');
          this.isLoading.set(false);
        }
      });
    }
  }
}
