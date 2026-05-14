import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { App } from '../../../app';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

    const identifier = this.loginType() === 'hr' ? this.credentials.email : this.credentials.employeeId;

    this.apiService.login(identifier, this.credentials.password).subscribe({
      next: (res) => {
        // Use the role returned by unified-login
        const actualRole = res.role;
        const userData = res.user || res.employee;

        localStorage.setItem('user_role', actualRole);
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (res.token) localStorage.setItem('auth_token', res.token);
        
        this.app.userRole.set(actualRole);

        if (actualRole === 'hr') {
          this.router.navigate(['/dashboard']);
        } else if (actualRole === 'employee' || actualRole === 'manager') {
          this.router.navigate(['/employee/dashboard']);
        } else {
          this.errorMessage.set('Unauthorized role for this portal');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Login failed');
        this.isLoading.set(false);
      }
    });
  }
}
