import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Add this import
import { DatePipe } from '@angular/common';

import { MaterialModule } from '../../shared/material.module';

import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';


@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeFormComponent,
    EmployeeDetailComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Required for routerLink
    EmployeesRoutingModule,
    MaterialModule // This provides all Material components
  ],
  providers: [DatePipe]
})
export class EmployeesModule { }
