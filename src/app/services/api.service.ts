import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private useLocalBackend = false;
  private baseUrl = this.useLocalBackend 
    ? 'http://localhost:5001' 
    : 'https://peoplesoft-backend.onrender.com';

  constructor(private http: HttpClient) {}

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Dashboard Stats
  getDashboardStats(): Observable<any> {
    return forkJoin({
      activeInterns: this.http.get<any[]>(`${this.baseUrl}/api/intern/all/active`),
      initialInterns: this.http.get<any[]>(`${this.baseUrl}/api/intern/all/initial`),
      activeEmployees: this.http.get<any[]>(`${this.baseUrl}/api/employee/all/active`),
      internAttendance: this.http.get<any>(`${this.baseUrl}/api/attendance/today/all`),
      employeeAttendance: this.http.get<any>(`${this.baseUrl}/api/employeeAttanance/employee/today/all`),
      pendingLeaves: this.http.get<any[]>(`${this.baseUrl}/api/leave/pending`),
      // employeePendingLeaves: this.http.get<any[]>(`${this.baseUrl}/api/employee-leave/pending`), // Add if available
    }).pipe(
      map(data => {
        return {
          interns: [
            { label: 'Today Attendance', value: data.internAttendance.count.toString(), icon: 'CheckCircle2', color: 'green' },
            { label: 'Pending Leaves', value: data.pendingLeaves.length.toString(), icon: 'Clock', color: 'orange' },
            { label: 'Active Interns', value: data.activeInterns.length.toString(), icon: 'Users', color: 'teal' },
            { label: 'New Applications', value: data.initialInterns.length.toString(), icon: 'ClipboardList', color: 'blue' }
          ],
          employees: [
            { label: 'Today Attendance', value: data.employeeAttendance.count.toString(), icon: 'CheckCircle2', color: 'green' },
            { label: 'Total Employees', value: data.activeEmployees.length.toString(), icon: 'Briefcase', color: 'teal' },
            { label: 'Active Projects', value: '14', icon: 'ListTodo', color: 'purple' },
            { label: 'Payroll Status', value: 'Paid', icon: 'CircleDollarSign', color: 'green' }
          ]
        };
      })
    );
  }

  // Interns
  getAllActiveInterns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/intern/all/active`);
  }

  // Employees
  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employee/all/active`);
  }
}
