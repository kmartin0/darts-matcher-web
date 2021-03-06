import {NgModule} from '@angular/core';
import {LoginFormComponent} from './components/login-form/login-form.component';
import {UserFormComponent} from './components/user-form/user-form.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import {MatchFormComponent} from './components/match-form/match-form.component';
import {CreateMatchComponent} from './components/create-match/create-match.component';
import {MatRadioModule} from '@angular/material/radio';
import { NumOfDartsDialogComponent } from './components/num-of-darts-dialog/num-of-darts-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { EditThrowDialogComponent } from './components/edit-throw-dialog/edit-throw-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import { X01EditActionsDialogComponent } from './components/x01-edit-actions-dialog/x01-edit-actions-dialog.component';
import { BasicDialogComponent } from './components/basic-dialog/basic-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { LoseFocusAfterClickDirective } from './components/lose-focus-after-click-directive/lose-focus-after-click.directive';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DartBotInfoDialogComponent } from './components/dart-bot-info-dialog/dart-bot-info-dialog.component';
import {MatTableModule} from '@angular/material/table';
import { LoginFormDialogComponent } from './components/login-form-dialog/login-form-dialog.component';
import { SearchUserFormComponent } from './components/search-user-form/search-user-form.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ConfigureMatchPlayerDialogComponent } from './components/configure-match-player-dialog/configure-match-player-dialog.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import { EditMatchFormDialogComponent } from './components/edit-match-form-dialog/edit-match-form-dialog.component';
import { BaseToolbarComponent } from './components/base-toolbar/base-toolbar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

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
    MatchFormComponent,
    CreateMatchComponent,
    NumOfDartsDialogComponent,
    EditThrowDialogComponent,
    X01EditActionsDialogComponent,
    BasicDialogComponent,
    LoseFocusAfterClickDirective,
    DartBotInfoDialogComponent,
    LoginFormDialogComponent,
    SearchUserFormComponent,
    ConfigureMatchPlayerDialogComponent,
    EditMatchFormDialogComponent,
    BaseToolbarComponent,
    ThemeToggleComponent
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
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatTableModule,
    MatAutocompleteModule,
    FormsModule,
    MatStepperModule,
    MatListModule,
    MatCardModule,
    MatToolbarModule
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
    MatchFormComponent,
    CreateMatchComponent,
    NumOfDartsDialogComponent,
    EditThrowDialogComponent,
    X01EditActionsDialogComponent,
    BasicDialogComponent,
    LoseFocusAfterClickDirective,
    SearchUserFormComponent,
    BaseToolbarComponent
  ],

})
export class SharedModule {
}
