import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseFormComponent} from '../base-form/base-form.component';
import {UserAuthentication} from '../../models/user-authentication';

@Component({
  selector: 'app-form-login',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent extends BaseFormComponent<UserAuthentication> {

  private _loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(fb: FormBuilder) {
    super(fb);
  }

  get form(): FormGroup {
    return this._loginForm;
  }
}
