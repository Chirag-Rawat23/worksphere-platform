import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { SalaryService } from '../../../core/services/salary.service';

interface PayrollEntry {
  id: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: 'Pending' | 'Paid';
  createdAt: string;
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent {
  displayedColumns = ['period', 'salary', 'status', 'action'];
  payrollList: PayrollEntry[] = [];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private salaryService: SalaryService
  ) {
    this.loadPayroll();
  }

  downloadPayslip(entry: PayrollEntry): void {
    const user = this.authService.getCurrentUser();
    const content = [
      `Payslip for ${user?.name || 'Employee'}`,
      `Email: ${user?.email || 'employee@company.com'}`,
      `Pay Period: ${this.formatPeriod(entry)}`,
      `Salary: $${entry.amount.toFixed(2)}`,
      `Status: ${entry.status}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${entry.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private loadPayroll(): void {
    const key = this.storageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.payrollList = Array.isArray(parsed) ? parsed.map(entry => this.normalizeEntry(entry)) : [];
        return;
      } catch {
        // fall through to seed
      }
    }

    this.seedPayrollFromSalary(key);
  }

  private storageKey(): string {
    const email = (this.authService.getCurrentUser()?.email || 'employee').toLowerCase();
    return `employee_payroll_${email}`;
  }

  formatPeriod(entry: PayrollEntry): string {
    const start = new Date(entry.periodStart);
    const end = new Date(entry.periodEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Invalid period';
    }
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} to ${end.toLocaleDateString('en-US', opts)}`;
  }

  private normalizeEntry(entry: any): PayrollEntry {
    if (entry.periodStart && entry.periodEnd && entry.amount != null) {
      return entry as PayrollEntry;
    }

    // Legacy support: { period: string, salary: number }
    return {
      id: entry.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      periodStart: entry.periodStart || entry.periodEnd || new Date().toISOString(),
      periodEnd: entry.periodEnd || entry.periodStart || new Date().toISOString(),
      amount: typeof entry.amount === 'number' ? entry.amount : Number(entry.salary || 0),
      status: entry.status === 'Paid' ? 'Paid' : 'Pending',
      createdAt: entry.createdAt || new Date().toISOString()
    };
  }

  private seedPayrollFromSalary(key: string): void {
    const userEmail = (this.authService.getCurrentUser()?.email || '').toLowerCase();
    if (!userEmail) {
      this.payrollList = [];
      return;
    }

    forkJoin([
      this.employeeService.getEmployees(),
      this.salaryService.getSalaries()
    ]).subscribe({
      next: ([employees, salaries]) => {
        const employee = employees.find(e => (e.email || '').toLowerCase() === userEmail);
        if (!employee) {
          this.payrollList = [];
          return;
        }

        const latestSalary = salaries
          .filter(s => s.employeeId === employee.id)
          .sort((a, b) => new Date(b.effectiveDate || 0).getTime() - new Date(a.effectiveDate || 0).getTime())[0];

        if (!latestSalary || !latestSalary.baseAmount) {
          this.payrollList = [];
          return;
        }

        const annualAmount = Number(latestSalary.baseAmount);
        const monthlyAmount = Math.round((annualAmount / 12) * 100) / 100;
        const now = new Date();
        const year = now.getFullYear();
        const currentMonth = now.getMonth();

        const entries: PayrollEntry[] = [];
        const monthsToShow = [currentMonth, currentMonth - 1].filter(m => m >= 0);
        monthsToShow.forEach(month => {
          const start = new Date(year, month, 1);
          const end = new Date(year, month + 1, 0);
          const status: 'Pending' | 'Paid' = month <= currentMonth ? 'Paid' : 'Pending';
          entries.push({
            id: `${year}-${month + 1}-${employee.id}`,
            periodStart: start.toISOString(),
            periodEnd: end.toISOString(),
            amount: monthlyAmount,
            status,
            createdAt: new Date().toISOString()
          });
        });

        this.payrollList = entries.sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime());
        localStorage.setItem(key, JSON.stringify(this.payrollList));
      },
      error: () => {
        this.payrollList = [];
      }
    });
  }
}
