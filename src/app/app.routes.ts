import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { InternList } from './features/interns/intern-list/intern-list';
import { InternAdd } from './features/interns/intern-add/intern-add';
import { EmployeeList } from './features/employees/employee-list/employee-list';
import { InternDetails } from './features/interns/intern-details/intern-details';
import { InternAttendance } from './features/interns/intern-attendance/intern-attendance';
import { InternLeaves } from './features/interns/intern-leaves/intern-leaves';
import { InternReview } from './features/interns/intern-review/intern-review';
import { EmployeeDetails } from './features/employees/employee-details/employee-details';
import { EmployeeAttendance } from './features/employees/employee-attendance/employee-attendance';
import { EmployeePayroll } from './features/employees/employee-payroll/employee-payroll';
import { EmployeeReview } from './features/employees/employee-review/employee-review';
import { LeaveManagement } from './features/leaves/leave-management/leave-management';
import { OrgHierarchy } from './features/org-hierarchy/org-hierarchy';
import { HrPolicies } from './features/hr-policies/hr-policies';
import { HolidayCalendar } from './features/holiday-calendar/holiday-calendar';
import { InternRequests } from './features/interns/intern-requests/intern-requests';
import { EmployeeRequests } from './features/employees/employee-requests/employee-requests';
import { EmployeeDashboard } from './features/employees/employee-dashboard/employee-dashboard';
import { EmployeeAdd } from './features/employees/employee-add/employee-add';
import { AppSettings } from './features/app-settings/app-settings';
import { CertificateSettings } from './features/certificate-settings/certificate-settings';
import { OffboardingRequests } from './features/offboarding/offboarding-requests/offboarding-requests';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'employee/dashboard', component: EmployeeDashboard },
  { path: 'org-hierarchy', component: OrgHierarchy },
  { path: 'app-settings', component: AppSettings },
  { path: 'certificate-settings', component: CertificateSettings },
  { path: 'hr-policies', component: HrPolicies },
  { path: 'holiday-calendar', component: HolidayCalendar }, 
  { path: 'interns', component: InternList },
  { path: 'interns/requests', component: InternRequests },
  { path: 'interns/approve/:id', component: InternAdd },
  { path: 'interns/:id', component: InternDetails },
  { path: 'interns/:id/attendance', component: InternAttendance },
  { path: 'interns/:id/leaves', component: InternLeaves },
  { path: 'interns/:id/review', component: InternReview },
  { path: 'employees', component: EmployeeList },
  { path: 'employees/requests', component: EmployeeRequests },
  { path: 'employees/approve/:id', component: EmployeeAdd }, // We'll update details to handle approval if needed, or create EmployeeApprove
  { path: 'employees/:id', component: EmployeeDetails },
  { path: 'employees/:id/attendance', component: EmployeeAttendance },
  { path: 'employees/:id/payroll', component: EmployeePayroll },
  { path: 'employees/:id/review', component: EmployeeReview },
  { path: 'leaves', component: LeaveManagement },
  { path: 'assignments', loadComponent: () => import('./features/assignments/manager-assignments/manager-assignments').then(m => m.ManagerAssignments) },
  { path: 'offboarding', component: OffboardingRequests },
  { path: 'interns/attendance/corrections', loadComponent: () => import('./features/interns/attendance-corrections/attendance-corrections').then(m => m.AttendanceCorrections) },
];
