import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

interface AttendanceRecord {
  date: string;
  clockIn?: string;
  clockOut?: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  records: AttendanceRecord[] = [];
  displayedColumns = ['date', 'clockIn', 'clockOut'];

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAttendance();
  }

  clockIn(): void {
    const today = this.todayKey();
    const record = this.records.find(item => item.date === today);
    if (record?.clockIn) {
      this.showNotice('You have already clocked in today.', true);
      return;
    }

    if (record) {
      record.clockIn = new Date().toISOString();
    } else {
      this.records.unshift({ date: today, clockIn: new Date().toISOString() });
    }

    this.persistAttendance();
    this.records = [...this.records];
    this.showNotice('Clock in recorded.');
  }

  clockOut(): void {
    const today = this.todayKey();
    const record = this.records.find(item => item.date === today);
    if (!record?.clockIn) {
      this.showNotice('Clock in first before clocking out.', true);
      return;
    }

    if (record.clockOut) {
      this.showNotice('You have already clocked out today.', true);
      return;
    }

    record.clockOut = new Date().toISOString();
    this.persistAttendance();
    this.records = [...this.records];
    this.showNotice('Clock out recorded.');
  }

  getTodayStatus(): string | null {
    const record = this.records.find(item => item.date === this.todayKey());
    if (!record) {
      return null;
    }
    if (record.clockIn && record.clockOut) {
      return 'You have already clocked in and out today.';
    }
    if (record.clockIn) {
      return 'You have already clocked in today.';
    }
    return null;
  }

  isClockInDisabled(): boolean {
    const record = this.records.find(item => item.date === this.todayKey());
    return Boolean(record?.clockIn);
  }

  isClockOutDisabled(): boolean {
    const record = this.records.find(item => item.date === this.todayKey());
    return !record?.clockIn || Boolean(record?.clockOut);
  }

  private loadAttendance(): void {
    const stored = localStorage.getItem(this.storageKey());
    this.records = stored ? JSON.parse(stored) : [];
  }

  private persistAttendance(): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.records));
  }

  private todayKey(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private showNotice(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [isError ? 'error-snackbar' : 'success-snackbar']
    });
  }

  private storageKey(): string {
    const email = (this.authService.getCurrentUser()?.email || 'employee').toLowerCase();
    return `employee_attendance_${email}`;
  }
}
