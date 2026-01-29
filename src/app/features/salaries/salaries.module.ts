import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalariesRoutingModule } from './salaries-routing.module';
import { SalaryFormComponent } from './salary-form/salary-form.component';
import { SalaryListComponent } from './salary-list/salary-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { SalaryDetailComponent } from './salary-detail/salary-detail.component';


@NgModule({
  declarations: [SalaryFormComponent, SalaryListComponent, SalaryDetailComponent],
  imports: [
    CommonModule,
    SalariesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule
  ]
})
export class SalariesModule { }
