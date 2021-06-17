import {Component, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user';
import {BaseFormComponent} from '../base-form/base-form.component';
import {searchUserFormValidator} from './search-user-form-validator.directive';
import {ApiErrorBody} from '../../../api/error/api-error-body';
import {ApiErrorEnum} from '../../../api/error/api-error.enum';

@Component({
  selector: 'app-search-user-form',
  templateUrl: './search-user-form.component.html',
  styleUrls: ['./search-user-form.component.scss']
})
export class SearchUserFormComponent extends BaseFormComponent<User> {

  @Input() submitTitle = 'Submit';

  private searchForm = this.fb.group({
    query: this.fb.control('', [Validators.required, searchUserFormValidator()])
  });

  get form(): FormGroup {
    return this.searchForm;
  }

  users$: Observable<User[]>;

  constructor(fb: FormBuilder, private userService: UserService) {
    super(fb);

    this.users$ = this.searchForm.get('query').valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(value => value && typeof value === 'string' ? this.userService.searchUsers(value) : of([]))
    );
  }

  displayFn(user: User): string {

    return user ? `${user?.firstName} ${user?.lastName} (${user?.userName})` : '';
  }

  handleApiError(apiError: ApiErrorBody) {
    super.handleApiError(apiError);

    switch (apiError.error) {
      case ApiErrorEnum.PERMISSION_DENIED: {
        this.setError('', 'Permission Denied.');
        break;
      }
      case ApiErrorEnum.INTERNAL: {
        this.setError('', 'Oops, Something went wrong.');
        break;
      }
      case ApiErrorEnum.ALREADY_EXISTS: {
        this.setError('', 'This friend (request) already exists.');
        break;
      }
      case ApiErrorEnum.INVALID_ARGUMENTS: {
        this.setError('', apiError.details.receiver);
        break;
      }
    }
  }

  protected createFormResult(): User {
    return Object.assign({}, this.form.get('query').value) as User;
  }
}
