import { Routes } from '@angular/router';
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

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'org-hierarchy', component: OrgHierarchy },
  { path: 'hr-policies', component: HrPolicies },
  { path: 'holiday-calendar', component: HolidayCalendar },
  { path: 'interns', component: InternList },
  { path: 'interns/add', component: InternAdd },
  { path: 'interns/:id', component: InternDetails },
  { path: 'interns/:id/attendance', component: InternAttendance },
  { path: 'interns/:id/leaves', component: InternLeaves },
  { path: 'interns/:id/review', component: InternReview },
  { path: 'employees', component: EmployeeList },
  { path: 'employees/:id', component: EmployeeDetails },
  { path: 'employees/:id/attendance', component: EmployeeAttendance },
  { path: 'employees/:id/payroll', component: EmployeePayroll },
  { path: 'employees/:id/review', component: EmployeeReview },
  { path: 'leaves', component: LeaveManagement },
];
