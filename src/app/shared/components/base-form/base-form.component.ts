import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {AbstractControl, FormArray, FormBuilder, FormGroup, NgForm} from '@angular/forms';
import {ApiErrorBody, isApiErrorBody} from '../../../api/error/api-error-body';

@Component({
  template: ''
})
export abstract class BaseFormComponent<T> {

  @ViewChild('formDirective') protected formDirective: NgForm;
  @Input() loading$: Subject<boolean>;
  @Output() validForm = new EventEmitter<T>();

  protected constructor(protected fb: FormBuilder) {
  }

  abstract get form(): FormGroup;

  handleApiError(apiError: ApiErrorBody) {
    if (!isApiErrorBody(apiError)) this.setError('', 'An unknown error occurred');
  }

  onSubmitForm() {
    this.updateFormValidity(this.form);

    if (this.form.valid) {
      this.validForm.emit(this.createFormResult());
    }
  }

  resetForm(value?: any) {
    if (!this.formDirective) throw new Error('Form must have a directive\'#formDirective="ngForm"\' to reset');

    this.formDirective.resetForm(value);
  }

  setError(formControlKey: string, error: string) {
    if (!error) return;

    const control = this.form.get(formControlKey) || this.form;

    if (control) {
      const tmpErrors = control.errors ?? {};
      Object.assign(tmpErrors, {customError: error});
      control.setErrors(tmpErrors);
    }
  }

  updateFormValidity(control: AbstractControl) {
    control.updateValueAndValidity();
    control.markAsTouched();

    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        this.updateFormValidity(control.get(key));
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(_control => {
        this.updateFormValidity(_control);
      });
    }
  }

  protected createFormResult(): T {
    return Object.assign({}, this.form.value) as T;
  }

}
