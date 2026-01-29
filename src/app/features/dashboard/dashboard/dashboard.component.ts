import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { SalaryService } from '../../../core/services/salary.service';
import { Employee, Department, Candidate, Salary } from '../../../shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

interface DashboardMetrics {
  totalEmployees: number;
  totalDepartments: number;
  totalCandidates: number;
  activeCandidates: number;
  totalPayroll: number;
  averageSalary: number;
  departmentStats: { name: string; count: number; budget: number }[];
  recentHires: Employee[];
  upcomingAnniversaries: Employee[];
  candidateStatus: { status: string; count: number }[];
}

interface LeaveRequestEntry {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface LeaveRequestView extends LeaveRequestEntry {
  email: string;
  storageKey: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  body: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  isAdmin = false;
  isEmployee = false;
  employeePay = 0;
  employeeLeaveCount = 0;
  private currentUserEmail = '';
  adminLeaveRequests: LeaveRequestView[] = [];
  leaveDisplayedColumns = ['employee', 'startDate', 'endDate', 'reason', 'status', 'actions'];
  announcements: Announcement[] = [
    {
      id: '1',
      title: 'Updated Leave Policy',
      date: '2025-08-20',
      body: 'The leave policy has been updated. Please submit leave requests at least 7 days in advance.'
    },
    {
      id: '2',
      title: 'Payroll Schedule',
      date: '2025-08-15',
      body: 'Payroll for August will be processed on August 30.'
    },
    {
      id: '3',
      title: 'Team Town Hall',
      date: '2025-08-10',
      body: 'Join the town hall on August 25 at 3:00 PM in the main conference room.'
    }
  ];
  metrics: DashboardMetrics = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalCandidates: 0,
    activeCandidates: 0,
    totalPayroll: 0,
    averageSalary: 0,
    departmentStats: [],
    recentHires: [],
    upcomingAnniversaries: [],
    candidateStatus: []
  };

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private candidateService: CandidateService,
    private salaryService: SalaryService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = this.isAdminRole(user?.role);
    this.isEmployee = this.isEmployeeRole(user?.role);
    this.currentUserEmail = (user?.email || '').toLowerCase();
    this.employeeLeaveCount = this.getEmployeeLeaveCount();
    if (this.isEmployee) {
      this.employeePay = this.getEmployeePayrollAmount();
    }
    if (this.isAdmin) {
      this.adminLeaveRequests = this.loadLeaveRequests();
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin([
      this.employeeService.getEmployees(),
      this.departmentService.getDepartments(),
      this.candidateService.getCandidates(),
      this.salaryService.getSalaries()
    ])
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: ( [employees, departments, candidates, salaries ]) => {
        this.calculateMetrics(employees, departments, candidates, salaries);
      },
      error: () => this.showError('Failed to load dashboard data')
    });
  }

  calculateMetrics(
    employees: Employee[], 
    departments: Department[], 
    candidates: Candidate[], 
    salaries: Salary[]
  ): void {
    // Basic counts
    this.metrics.totalEmployees = employees.length;
    this.metrics.totalDepartments = departments.length;
    this.metrics.totalCandidates = candidates.length;
    this.metrics.activeCandidates = candidates.filter(c => 
      c.status === 'Applied' || c.status === 'Interviewed'
    ).length;

    // Salary calculations
    const totalSalary = salaries.reduce((sum, salary) => sum + (salary.baseAmount || 0), 0);
    this.metrics.totalPayroll = totalSalary;
    this.metrics.averageSalary = salaries.length > 0 ? totalSalary / salaries.length : 0;

    if (this.isEmployee && this.currentUserEmail) {
      const matchedEmployee = employees.find(emp => (emp.email || '').toLowerCase() === this.currentUserEmail);
      if (matchedEmployee) {
        const employeeSalaries = salaries
          .filter(salary => salary.employeeId === matchedEmployee.id)
          .sort((a, b) => new Date(b.effectiveDate || 0).getTime() - new Date(a.effectiveDate || 0).getTime());
        this.employeePay = employeeSalaries[0]?.baseAmount || 0;
      } else {
        this.employeePay = 0;
      }
    }
    if (this.isEmployee && this.employeePay === 0) {
      this.employeePay = this.getEmployeePayrollAmount();
    }

    // Department statistics
    this.metrics.departmentStats = departments.map(dept => ({
      name: dept.name,
      count: employees.filter(emp => emp.departmentId === dept.id).length,
      budget: dept.budget || 0
    }));

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.metrics.recentHires = employees
      .filter(emp => emp.hireDate && new Date(emp.hireDate) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
      .slice(0, 5);

    // Upcoming anniversaries (next 30 days)
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    this.metrics.upcomingAnniversaries = employees
      .filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        const thisYearAnniversary = new Date(today.getFullYear(), hireDate.getMonth(), hireDate.getDate());
        return thisYearAnniversary >= today && thisYearAnniversary <= next30Days;
      })
      .sort((a, b) => new Date(a.hireDate!).getTime() - new Date(b.hireDate!).getTime())
      .slice(0, 5);

    // Candidate status breakdown
    const statusCounts = candidates.reduce((acc, candidate) => {
      const status = candidate.status || 'Applied';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.metrics.candidateStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getDaysUntilAnniversary(hireDate: string | Date): number {
    const today = new Date();
    const anniversary = new Date(hireDate);
    anniversary.setFullYear(today.getFullYear());
    
    const diffTime = anniversary.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  private isAdminRole(role?: string): boolean {
    const normalized = (role || '').toLowerCase();
    return normalized === 'hr' || normalized === 'admin';
  }

  private isEmployeeRole(role?: string): boolean {
    const normalized = (role || '').toLowerCase();
    return normalized === 'employee';
  }

  private getEmployeeLeaveCount(): number {
    if (!this.currentUserEmail) {
      return 0;
    }
    const stored = localStorage.getItem(`employee_leaves_${this.currentUserEmail}`);
    if (!stored) {
      return 0;
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  private getEmployeePayrollAmount(): number {
    if (!this.currentUserEmail) {
      return 0;
    }
    const stored = localStorage.getItem(`employee_payroll_${this.currentUserEmail}`);
    if (!stored) {
      return 0;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return 0;
      }
      const latest = parsed[0];
      if (typeof latest.amount === 'number') {
        return latest.amount;
      }
      return typeof latest.salary === 'number' ? latest.salary : 0;
    } catch {
      return 0;
    }
  }

  loadLeaveRequests(): LeaveRequestView[] {
    const results: LeaveRequestView[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('employee_leaves_')) {
        continue;
      }
      const email = key.replace('employee_leaves_', '');
      const stored = localStorage.getItem(key);
      if (!stored) {
        continue;
      }
      try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          continue;
        }
        parsed.forEach((entry: LeaveRequestEntry) => {
          results.push({
            ...entry,
            email,
            storageKey: key
          });
        });
      } catch {
        // ignore malformed data
      }
    }
    return results.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  updateLeaveStatus(request: LeaveRequestView, status: 'Approved' | 'Rejected'): void {
    const stored = localStorage.getItem(request.storageKey);
    if (!stored) {
      this.showError('Leave record not found.');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        this.showError('Leave record not found.');
        return;
      }
      const updated = parsed.map((entry: LeaveRequestEntry) =>
        entry.id === request.id ? { ...entry, status } : entry
      );
      localStorage.setItem(request.storageKey, JSON.stringify(updated));
      this.adminLeaveRequests = this.adminLeaveRequests.map(entry =>
        entry.id === request.id && entry.storageKey === request.storageKey
          ? { ...entry, status }
          : entry
      );
      this.showSuccess(`Leave request ${status.toLowerCase()}.`);
    } catch {
      this.showError('Failed to update leave request.');
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
