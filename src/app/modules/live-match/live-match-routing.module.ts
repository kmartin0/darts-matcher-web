import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LiveMatchComponent} from './pages/live-match/live-match.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    pathMatch: 'prefix',
    component: LiveMatchComponent,
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(dashboardRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class LiveMatchRoutingModule {
}
