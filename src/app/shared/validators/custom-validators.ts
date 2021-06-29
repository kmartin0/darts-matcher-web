import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class CustomValidators {

  static minLengthArray(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      return control.value.length >= minLength ? null : {
        minLengthArray: {
          actual: control.value.length,
          min: minLength
        }
      };
    };
  }

  static confirmPasswordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (password.pristine || confirmPassword.pristine) return null;

      return password && confirmPassword && password.value !== confirmPassword.value ? {confirmPassword: false} : null;
    };
  }

}
