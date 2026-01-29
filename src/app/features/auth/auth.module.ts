import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { LoginComponent } from './login/login.component';
import { EmployeeLoginComponent } from './employee-login/employee-login.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    EmployeeLoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
