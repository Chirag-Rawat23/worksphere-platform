import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';


const routes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'leave-requests', component: LeaveRequestsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
