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
    }).pipe(
      map(data => {
        // Map recent activities
        const activities: any[] = [];
        
        // Add newest applications
        if (data.initialInterns && data.initialInterns.length > 0) {
          data.initialInterns.slice(-3).forEach(intern => {
            activities.push({
              title: `New Intern Application: ${intern.fullName}`,
              description: `Status: ${intern.status || 'Initial'}`,
              time: 'Recently',
              icon: 'Users',
              color: 'blue'
            });
          });
        }

        // Add pending leaves
        if (data.pendingLeaves && data.pendingLeaves.length > 0) {
          data.pendingLeaves.slice(-3).forEach(leave => {
            activities.push({
              title: `Leave Request: ${leave.internName || 'Intern'}`,
              description: `${leave.leaveType} for ${leave.reason || 'personal'}`,
              time: 'Pending',
              icon: 'Clock',
              color: 'orange'
            });
          });
        }

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
          ],
          activities: activities.length > 0 ? activities : [
            { title: 'No recent activity', description: 'Everything is up to date', time: 'Now', icon: 'CheckCircle2', color: 'green' }
          ]
        };
      })
    );
  }

  // Interns
  getAllActiveInterns(range: string = 'all', status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/intern/all/active`, {
      params: { range, status }
    });
  }

  getInternById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/intern/get/${id}`).pipe(
      map(res => res.intern)
    );
  }

  addIntern(intern: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/intern/add`, intern);
  }

  // Employees
  getAllEmployees(status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employee/all/active`, {
      params: { status }
    });
  }

  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/employee/get/${id}`).pipe(
      map(res => res.employee)
    );
  }

  // Attendance
  getInternAttendance(internId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/attendance/intern/${internId}`);
  }

  getEmployeeAttendance(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employeeAttanance/employee/${employeeId}`);
  }

  // Leaves
  getInternLeaves(internId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/leave/intern/${internId}`);
  }

  getEmployeeLeaves(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employee-leave/employee/${employeeId}`);
  }

  // Reviews
  getInternReview(internId: string, month: string = ''): Observable<any> {
    const url = `${this.baseUrl}/api/reviews/${internId}`;
    const params: { [key: string]: string } = {};
    if (month) params['month'] = month;
    return this.http.get<any>(url, { params });
  }

  getEmployeeReview(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employeeReview/employee/${employeeId}`);
  }

  // Holidays
  getHolidays(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/holidays`);
  }

  saveHoliday(holiday: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/holidays`, holiday);
  }

  deleteHoliday(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/holidays/${id}`);
  }

  // Policies
  getPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/policy/all`);
  }

  savePolicy(policy: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/policy/add`, policy);
  }

  deletePolicy(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/policy/${id}`);
  }

  // Hierarchy (Org Hierarchy)
  getOrgHierarchy(): Observable<any> {
    // Backend seems to use hr policy logic for hierarchy too
    return this.http.get<any>(`${this.baseUrl}/api/hr/policy?email=admin@softrate.com`);
  }

  saveOrgHierarchy(url: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/hr/policy/save`, {
      email: 'admin@softrate.com',
      policyUrl: url
    });
  }
}
