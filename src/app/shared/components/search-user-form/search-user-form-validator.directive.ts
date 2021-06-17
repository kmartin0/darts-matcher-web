import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {isUser} from '../../models/user';

export function searchUserFormValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return !isUser(control.value) ? {selectUserError: 'Please select a user.'} : null;
  };
}
