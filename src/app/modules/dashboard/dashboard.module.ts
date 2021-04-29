import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatchHistoryComponent } from './pages/match-history/match-history.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [DashboardComponent, MatchHistoryComponent],
  exports: [
    MatchHistoryComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ]
})
export class DashboardModule { }
