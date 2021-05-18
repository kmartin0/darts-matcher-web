import {NgModule} from '@angular/core';
import {LoginFormComponent} from './components/login-form/login-form.component';
import {UserFormComponent} from './components/user-form/user-form.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {HttpClientModule} from '@angular/common/http';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {UnauthenticatedComponent} from './components/unauthenticated/unauthenticated.component';
import {RouterModule} from '@angular/router';
import { FormControlErrorComponent } from './components/form-control-error/form-control-error.component';
import { FormControlErrorDirective } from './components/form-control-error/form-control-error.directive';
import { LoadingDirective } from './components/loading/loading.directive';
import { LoadingComponent } from './components/loading/loading.component';
import {MatIconModule} from '@angular/material/icon';
import {CreateMatchFormComponent} from './components/create-match-form/create-match-form.component';
import {CreateMatchComponent} from './components/create-match/create-match.component';
import {MatRadioModule} from '@angular/material/radio';
import { FinalThrowDialogComponent } from './components/final-throw-dialog/final-throw-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { EditThrowDialogComponent } from './components/edit-throw-dialog/edit-throw-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import { EditSetLegDialogComponent } from './components/edit-set-leg-dialog/edit-set-leg-dialog.component';
import { BasicDialogComponent } from './components/basic-dialog/basic-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSliderModule} from '@angular/material/slider';

@NgModule({
  declarations: [
    LoginFormComponent,
    UserFormComponent,
    PageNotFoundComponent,
    UnauthenticatedComponent,
    FormControlErrorComponent,
    FormControlErrorDirective,
    LoadingDirective,
    LoadingComponent,
    CreateMatchFormComponent,
    CreateMatchComponent,
    FinalThrowDialogComponent,
    EditThrowDialogComponent,
    EditSetLegDialogComponent,
    BasicDialogComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSliderModule
  ],
  exports: [
    LoginFormComponent,
    UserFormComponent,
    PageNotFoundComponent,
    UnauthenticatedComponent,
    FormControlErrorComponent,
    FormControlErrorDirective,
    LoadingDirective,
    LoadingComponent,
    CreateMatchFormComponent,
    CreateMatchComponent,
    FinalThrowDialogComponent,
    EditThrowDialogComponent,
    EditSetLegDialogComponent,
    BasicDialogComponent
  ],

})
export class SharedModule {
}
