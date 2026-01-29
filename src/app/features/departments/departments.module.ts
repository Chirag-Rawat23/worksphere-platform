import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';


@NgModule({
  declarations: [DepartmentListComponent, DepartmentFormComponent, DepartmentDetailComponent],
  imports: [
    CommonModule,
    RouterModule,
    DepartmentsRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DepartmentsModule { }
