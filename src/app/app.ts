import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  Network, 
  FileText, 
  Calendar, 
  Users, 
  Briefcase, 
  Search, 
  Bell, 
  Mail, 
  Download, 
  Plus, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  CircleDollarSign, 
  LogOut, 
  LineChart,
  Building2
} from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    LucideAngularModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private apiService = inject(ApiService);
  
  title = signal('admin-page');
  selectedModel = signal<'interns' | 'employees'>('interns');
  isLoading = signal(true);

  stats = signal<any>({
    interns: [],
    employees: []
  });

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.isLoading.set(true);
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch stats', err);
        this.isLoading.set(false);
      }
    });
  }

  selectModel(model: 'interns' | 'employees') {
    this.selectedModel.set(model);
  }
}
