import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {confirmPasswordMatchValidator} from '../../validators/confirm-password-match.directive';
import {User} from '../../models/user';
import {BaseFormComponent} from '../base-form/base-form.component';
import {ApiErrorBody, isApiErrorBody} from '../../../api/error/api-error-body';
import {ApiErrorEnum} from '../../../api/error/api-error.enum';

@Component({
  selector: 'app-form-user',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent extends BaseFormComponent<User> {

  private _userForm = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
    firstName: ['', [Validators.required, Validators.maxLength(24)]],
    lastName: ['', [Validators.required, Validators.maxLength(24)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
  }, {validators: confirmPasswordMatchValidator});

  constructor(fb: FormBuilder) {
    super(fb);
  }

  get form(): FormGroup {
    return this._userForm;
  }

  handleApiError(apiError: ApiErrorBody) {
    super.handleApiError(apiError);

    if (isApiErrorBody(apiError)) {
      switch (apiError.error) {
        case ApiErrorEnum.INVALID_ARGUMENTS: {
          this.setError('userName', apiError.details.userName);
          this.setError('firstName', apiError.details.firstName);
          this.setError('lastName', apiError.details.lastName);
          this.setError('email', apiError.details.email);
          this.setError('password', apiError.details.password);
          break;
        }
        case ApiErrorEnum.ALREADY_EXISTS: {
          this.setError('userName', apiError.details.userName);
          this.setError('email', apiError.details.email);
          break;
        }
      }
    }
  }

}
