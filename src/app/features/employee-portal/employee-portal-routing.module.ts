import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { PayrollComponent } from './payroll/payroll.component';
import { AnnouncementsComponent } from './announcements/announcements.component';

const routes: Routes = [
  { path: 'leave', component: LeaveManagementComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'payroll', component: PayrollComponent },
  { path: 'announcements', component: AnnouncementsComponent },
  { path: '', redirectTo: 'leave', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeePortalRoutingModule {}
