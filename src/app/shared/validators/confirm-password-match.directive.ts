import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export const confirmPasswordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password.pristine || confirmPassword.pristine) return null;

  return password && confirmPassword && password.value !== confirmPassword.value ? {confirmPassword: false} : null;
};
