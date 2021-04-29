import {NgModule} from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {CommonModule} from '@angular/common';
import {PageNotFoundComponent} from '../../shared/components/page-not-found/page-not-found.component';
import {AuthGuard} from '../guard/auth.guard';
import {UnauthenticatedComponent} from '../../shared/components/unauthenticated/unauthenticated.component';

export const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../../modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'live-match/:id',
    loadChildren: () => import('../../modules/live-match/live-match.module').then(m => m.LiveMatchModule)
  },
  {
    path: '',
    loadChildren: () => import('../../modules/home/home.module').then(m => m.HomeModule),
  },
{path: 'unauthenticated', component: UnauthenticatedComponent},
{path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(appRoutes /*, {preloadingStrategy: PreloadAllModules}*/, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
