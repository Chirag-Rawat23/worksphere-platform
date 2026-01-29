import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

interface LeaveEntry {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss']
})
export class LeaveManagementComponent implements OnInit {
  leaveForm: FormGroup;
  leaveHistory: LeaveEntry[] = [];
  displayedColumns = ['startDate', 'endDate', 'reason', 'status'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.leaveForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.loadLeaveHistory();
  }

  submitLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const { startDate, endDate, reason } = this.leaveForm.value;
    const entry: LeaveEntry = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      reason: reason.trim(),
      status: 'Pending'
    };

    this.leaveHistory = [entry, ...this.leaveHistory];
    this.persistLeaveHistory();
    this.leaveForm.reset();
    this.snackBar.open('Leave request submitted.', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private loadLeaveHistory(): void {
    const stored = localStorage.getItem(this.storageKey());
    this.leaveHistory = stored ? JSON.parse(stored) : [];
  }

  private persistLeaveHistory(): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.leaveHistory));
  }

  private storageKey(): string {
    const email = (this.authService.getCurrentUser()?.email || 'employee').toLowerCase();
    return `employee_leaves_${email}`;
  }
}
