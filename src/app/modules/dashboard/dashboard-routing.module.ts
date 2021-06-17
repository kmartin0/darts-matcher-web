import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {AuthGuard} from '../../core/guard/auth.guard';
import {CreateMatchComponent} from '../../shared/components/create-match/create-match.component';
import {FriendsComponent} from './pages/friends/friends.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    pathMatch: 'prefix',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'prefix',
        canActivateChild: [AuthGuard],
        children: [
          {
            path: '',
            pathMatch: 'prefix',
            redirectTo: 'create-match',
          },
          {
            path: 'create-match',
            component: CreateMatchComponent,
            data: {title: 'Create X01Match'}
          },
          {
            path: 'friends',
            component: FriendsComponent,
            data: {title: 'Friends'}
          },
        ]
      }
    ]
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
export class DashboardRoutingModule {
}
