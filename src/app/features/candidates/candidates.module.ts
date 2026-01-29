import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';

import { CandidatesRoutingModule } from './candidates-routing.module';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { CandidateFormComponent } from './candidate-form/candidate-form.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';
import { HireCandidateComponent } from './hire-candidate/hire-candidate.component';


@NgModule({
  declarations: [CandidateListComponent, CandidateFormComponent, CandidateDetailComponent, HireCandidateComponent],
  imports: [
    CommonModule,
    RouterModule,
    CandidatesRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CandidatesModule { }
