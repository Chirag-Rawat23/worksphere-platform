import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss']
})
export class LeaveRequestsComponent implements OnInit {
  adminLeaveRequests: LeaveRequestView[] = [];
  displayedColumns = ['employee', 'startDate', 'endDate', 'reason', 'status', 'actions'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.adminLeaveRequests = this.loadLeaveRequests();
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

  private loadLeaveRequests(): LeaveRequestView[] {
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
