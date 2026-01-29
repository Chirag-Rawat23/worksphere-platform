import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m=> m.DashboardModule)
  },
  { 
    path: 'employees',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/employees/employees.module').then(m => m.EmployeesModule)
  },
  { 
    path: 'departments',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/departments/departments.module').then(m => m.DepartmentsModule)
  },
  { 
    path: 'candidates',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/candidates/candidates.module').then(m => m.CandidatesModule)
  },
  {
    path: 'salaries',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/salaries/salaries.module').then(m => m.SalariesModule)
  },
  {
    path: 'employee',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/employee-portal/employee-portal.module').then(m => m.EmployeePortalModule)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
