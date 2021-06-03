import {Component, OnDestroy, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {withLoading} from '../../helpers/operators';
import {takeUntil} from 'rxjs/operators';
import {UserAuthentication} from '../../models/user-authentication';
import {UserService} from '../../services/user.service';
import {LoginFormComponent} from '../login-form/login-form.component';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-login-form-dialog',
  templateUrl: './login-form-dialog.component.html',
  styleUrls: ['./login-form-dialog.component.scss']
})
export class LoginFormDialogComponent implements OnDestroy {

  loading$ = new Subject<boolean>();
  private unsubscribe$ = new Subject();

  @ViewChild(LoginFormComponent, {static: false}) private _loginFormComponent: LoginFormComponent;
  get loginFormComponent(): LoginFormComponent {
    return this._loginFormComponent;
  }

  constructor(public dialogRef: MatDialogRef<LoginFormDialogComponent>, private userService: UserService) {
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onLogout() {
    this.userService.logoutUser();
    this.dialogRef.close(false);
  }

  onValidForm(authentication: UserAuthentication) {
    this.userService.loginUser(authentication).pipe(
      withLoading(this.loading$),
      takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.dialogRef.close(true);
      }, error => {
        this.loginFormComponent.handleApiError(error);
      });
  }

}
