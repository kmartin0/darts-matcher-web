import {Component, OnDestroy, ViewChild} from '@angular/core';
import {User} from '../../../../shared/models/user';
import {UserService} from '../../../../shared/services/user.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {withLoading} from '../../../../shared/helpers/operators';
import {FormControl} from '@angular/forms';
import {UserFormComponent} from '../../../../shared/components/user-form/user-form.component';
import {LoginFormComponent} from '../../../../shared/components/login-form/login-form.component';
import {UserAuthentication} from '../../../../shared/models/user-authentication';
import {Router} from '@angular/router';
import {DASHBOARD, HOME_CREATE_MATCH} from '../../../../shared/constants/web-endpoints';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {

  private unsubscribe$ = new Subject();
  registerLoading$ = new BehaviorSubject<boolean>(false);
  loginLoading$ = new BehaviorSubject<boolean>(false);
  selectedTab = new FormControl(0);

  isLoggedInChecked = false;

  @ViewChild(UserFormComponent, {static: false}) private _registerFormComponent: UserFormComponent;
  get registerFormComponent(): UserFormComponent {
    return this._registerFormComponent;
  }

  @ViewChild(LoginFormComponent, {static: false}) private _loginFormComponent: LoginFormComponent;
  get loginFormComponent(): LoginFormComponent {
    return this._loginFormComponent;
  }

  constructor(private userService: UserService, private router: Router) {
    this.checkLoggedIn();
  }

  authenticateUser(authentication: UserAuthentication) {
    // this.userService.test().pipe(withLoading(this.loginLoading$)).subscribe(value => {
    //   console.log(value);
    // }, error => console.log(error));

    this.userService.loginUser(authentication).pipe(
      withLoading(this.loginLoading$),
      takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.handleAuthSuccess();
      }, error => {
        this.loginFormComponent.handleApiError(error);
      });
  }

  goToCreateMatch() {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate([HOME_CREATE_MATCH]);
  }

  registerUser(user: User) {
    this.userService.registerUser(user).pipe(
      withLoading(this.registerLoading$),
      takeUntil(this.unsubscribe$))
      .subscribe(registeredUser => {
        this.handleRegisterSuccess(registeredUser);
      }, error => {
        this.registerFormComponent.handleApiError(error);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private checkLoggedIn() {
    if (this.userService.getLoggedInUserOAuth2()) {
      this.handleAuthSuccess();
    } else {
      this.isLoggedInChecked = true;
    }
  }

  private handleAuthSuccess() {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate([DASHBOARD]);
  }

  private handleRegisterSuccess(user: User) {
    this.selectedTab.setValue(0);
    this.registerFormComponent.resetForm();
    this.loginFormComponent.resetForm({email: user.email});
  }

}
