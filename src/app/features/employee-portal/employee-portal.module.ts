import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { EmployeePortalRoutingModule } from './employee-portal-routing.module';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { PayrollComponent } from './payroll/payroll.component';
import { AnnouncementsComponent } from './announcements/announcements.component';

@NgModule({
  declarations: [
    LeaveManagementComponent,
    AttendanceComponent,
    PayrollComponent,
    AnnouncementsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    EmployeePortalRoutingModule
  ]
})
export class EmployeePortalModule {}
