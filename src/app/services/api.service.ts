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
    : 'https://peoplesoft-develop.onrender.com';

  constructor(private http: HttpClient) {}

  // Authentication
  login(identifier: string, password: string): Observable<any> {
    // Unified login handles email, employeeId, and internId
    return this.http.post(`${this.baseUrl}/api/auth/unified-login`, { 
      identifier: identifier, 
      password 
    });
  }

  hrLogin(email: string, password: string): Observable<any> {
    return this.login(email, password);
  }

  employeeLogin(employeeId: string, password: string): Observable<any> {
    return this.login(employeeId, password);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  registerCompany(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/onboarding/register`, data);
  }

  toggleManager(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/employee/toggle-manager/${id}`, {});
  }

  // Dashboard Stats
  getDashboardStats(): Observable<any> {
    return forkJoin({
      activeInterns: this.http.get<any[]>(`${this.baseUrl}/api/intern/all/active`),
      initialInterns: this.http.get<any[]>(`${this.baseUrl}/api/intern/all/initial`),
      activeEmployees: this.http.get<any[]>(`${this.baseUrl}/api/employee/all/active`),
      internAttendance: this.http.get<any>(`${this.baseUrl}/api/attendance/today/all`),
      employeeAttendance: this.http.get<any>(`${this.baseUrl}/api/employeeAttanance/employee/today/all`),
      pendingLeaves: this.http.get<any[]>(`${this.baseUrl}/api/employee-leave/hr-pending`),
      internTrend: this.http.get<any[]>(`${this.baseUrl}/api/attendance/trend`),
      employeeTrend: this.http.get<any[]>(`${this.baseUrl}/api/employeeAttanance/trend`),
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
              icon: 'fa-solid fa-users',
              color: 'blue'
            });
          });
        }

        // Add pending leaves
        if (data.pendingLeaves && data.pendingLeaves.length > 0) {
          data.pendingLeaves.slice(-3).forEach(leave => {
            activities.push({
              title: `Leave Request: ${leave.employeeName || 'Staff'}`,
              description: `${leave.leaveType} for ${leave.reason || 'personal'}`,
              time: 'Pending HR',
              icon: 'fa-solid fa-clock',
              color: 'orange'
            });
          });
        }

        const maxIntern = Math.max(...data.internTrend.map(t => t.count), 1);
        const maxEmployee = Math.max(...data.employeeTrend.map(t => t.count), 1);

        return {
          interns: [
            { label: 'Today Attendance', value: data.internAttendance.count.toString(), icon: 'fa-solid fa-circle-check', color: 'green' },
            { label: 'Pending Leaves', value: data.pendingLeaves.length.toString(), icon: 'fa-solid fa-clock', color: 'orange' },
            { label: 'Active Interns', value: data.activeInterns.length.toString(), icon: 'fa-solid fa-users', color: 'teal' },
            { label: 'New Applications', value: data.initialInterns.length.toString(), icon: 'fa-solid fa-list-check', color: 'blue' }
          ],
          employees: [
            { label: 'Today Attendance', value: data.employeeAttendance.count.toString(), icon: 'fa-solid fa-circle-check', color: 'green' },
            { label: 'Total Employees', value: data.activeEmployees.length.toString(), icon: 'fa-solid fa-briefcase', color: 'teal' },
            { label: 'Active Projects', value: '14', icon: 'fa-solid fa-list-ul', color: 'purple' },
            { label: 'Payroll Status', value: 'Paid', icon: 'fa-solid fa-circle-dollar-to-slot', color: 'green' }
          ],
          internTrend: data.internTrend.map(t => ({ ...t, height: (t.count / maxIntern) * 100 })),
          employeeTrend: data.employeeTrend.map(t => ({ ...t, height: (t.count / maxEmployee) * 100 })),
          activities: activities.length > 0 ? activities.reverse().slice(0, 3) : [
            { title: 'No recent activity', description: 'Everything is up to date', time: 'Now', icon: 'fa-solid fa-circle-check', color: 'green' }
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
  getAllEmployees(range: string = 'all', status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employee/all/active`, {
      params: { range, status }
    });
  }

  addEmployee(employee: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/employee/add`, employee);
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
    return this.http.get<any[]>(`${this.baseUrl}/api/employee-leave/employee/${internId}`);
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
    return this.http.get<any[]>(`${this.baseUrl}/api/employee-reviews/employee/${employeeId}`);
  }

  // Holidays
  getHolidays(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/holidays`);
  }

  saveHoliday(holiday: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/holidays`, holiday);
  }

  saveBulkHolidays(holidays: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/holidays/bulk`, holidays);
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
  getOrgHierarchy(email: string = 'admin@softrate.com'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/hr/policy?email=${email}`);
  }

  getGlobalPolicyUrl(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/hr/policy-only`);
  }

  saveOrgHierarchy(url: string, email: string = 'admin@softrate.com'): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/hr/policy/save`, {
      email: email,
      policyUrl: url
    });
  }
  acceptIntern(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/intern/accept/${id}`, data);
  }
  deleteIntern(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/intern/reject/${id}`);
  }
  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/employee/reject/${id}`);
  }
  acceptEmployee(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/employee/accept/${id}`, data);
  }

  // Manager Assignment & Review
  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employee/all/active`, {
      params: { range: 'all', status: 'approved' }
    }).pipe(
      map(emps => emps.filter(e => e.isManager === true))
    );
  }

  assignInternToManager(internId: string, managerId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/intern/assign-manager/${internId}`, { managerId });
  }

  getAssignedInterns(managerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/intern/assigned-to/${managerId}`);
  }

  managerReviewIntern(internId: string, status: 'approved' | 'rejected', remarks: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/intern/manager-review/${internId}`, { status, remarks });
  }

  // Attendance Correction Requests (HR)
  getHrPendingAttendanceRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/attendance-requests/hr-pending`);
  }

  hrReviewAttendanceRequest(requestId: string, status: 'approved' | 'rejected', remarks: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/attendance-requests/hr-review/${requestId}`, { status, remarks });
  }

  // HR Leave Management
  getHrPendingLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/employee-leave/hr-pending`);
  }

  hrReviewLeave(id: string, status: 'approved' | 'rejected', rejectionReason: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/employee-leave/hr-action/${id}`, { status, rejectionReason });
  }

  // Company Settings
  getCompanySettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/settings/company`);
  }

  updateCompanySettings(settings: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/settings/company`, settings);
  }

  // Offboarding / Resignations
  getPendingOffboarding(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/api/resignation/pending`).pipe(
      map(res => res.data)
    );
  }

  getManagerPendingOffboarding(managerId: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/api/resignation/manager-pending/${managerId}`).pipe(
      map(res => res.data)
    );
  }

  managerReviewOffboarding(id: string, status: 'approved' | 'rejected', remarks: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/resignation/manager-review/${id}`, { status, remarks });
  }

  hrReviewOffboarding(id: string, action: 'accept' | 'reject', remarks: string, flags: { internship: boolean, project: boolean, lor: boolean } = { internship: false, project: false, lor: false }): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/resignation/hr-review/${action}/${id}`, {
      remarks,
      internship: flags.internship,
      project: flags.project,
      lor: flags.lor
    });
  }

  // Performance Templates
  getPerformanceTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/performance-templates`);
  }

  savePerformanceTemplate(template: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/performance-templates`, template);
  }

  deletePerformanceTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/performance-templates/${id}`);
  }

  // Projects
  getManagerProjects(managerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/projects/manager/${managerId}`);
  }

  createProject(project: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/projects/create`, project);
  }

  updateProject(projectId: string, project: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/projects/update/${projectId}`, project);
  }

  toggleProjectTask(projectId: string, taskId: string, userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/projects/toggle-task/${projectId}/${taskId}`, { userId });
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/projects/${projectId}`);
  }

  // Generic Download with Auth
  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }
}
