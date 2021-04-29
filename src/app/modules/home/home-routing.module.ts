import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {HomeComponent} from './pages/home/home.component';
import {CreateMatchComponent} from '../../shared/components/create-match/create-match.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'create-match',
    component: CreateMatchComponent
  },
  // {
  //   path: 'forgot-password',
  //   component: ForgotPasswordComponent
  // },
  // {
  //   path: 'reset-password',
  //   component: ResetPasswordComponent
  // }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(homeRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class HomeRoutingModule {
}
