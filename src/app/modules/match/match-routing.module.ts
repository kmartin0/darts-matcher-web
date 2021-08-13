import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LiveMatchComponent} from './components/live-match/live-match.component';
import {MatchComponent} from './pages/match/match.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    pathMatch: 'prefix',
    component: MatchComponent,
    data: {title: 'Live Match'}
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
export class MatchRoutingModule {
}
