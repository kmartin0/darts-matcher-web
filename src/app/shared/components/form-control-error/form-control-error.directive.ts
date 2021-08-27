import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive, ElementRef,
  Inject, InjectionToken, Input, OnDestroy, OnInit,
  ViewContainerRef
} from '@angular/core';
import {FormControlErrorComponent} from './form-control-error.component';
import {Subject} from 'rxjs';
import {AbstractControl, ValidationErrors} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[appFormControlError]',
})
export class FormControlErrorDirective implements OnInit, OnDestroy {

  @Input() control: AbstractControl;

  ref: ComponentRef<FormControlErrorComponent>;

  private unsubscribe$ = new Subject();

  constructor(private elem: ElementRef,
              @Inject(FORM_ERRORS) private errors,
              private vcr: ViewContainerRef,
              private resolver: ComponentFactoryResolver) {
  }

  getErrorMessagesForValidationErrors(validationErrors: ValidationErrors): string[] {
    if (validationErrors === null) {
      return null;
    }

    // Define array to store the error messages.
    const errors = new Array<string>();

    // Iterate through validationErrors, construct user readable messages and store in errors array.
    Object.keys(validationErrors).forEach(key => {
      const error = this.errors[key];
      if (error != null) {
        errors.push(error instanceof Function ? error(validationErrors[key]) : error);
      } else {
        errors.push(validationErrors[key]);
      }
    });

    // Return array of user readable errors.
    return errors;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    if (!this.control || !this.control.statusChanges) throw new Error('Control should be defined.');
    this.control.statusChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      const controlErrors = this.control.errors;
      if (controlErrors) {
        this.setError(this.getErrorMessagesForValidationErrors(controlErrors)[0]);
      } else if (this.ref) {
        this.setError(null);
      }
    });
  }

  private setError(text: string) {
    if (!this.ref) {
      const factory = this.resolver.resolveComponentFactory(FormControlErrorComponent);
      this.ref = this.vcr.createComponent(factory);
    }
    this.ref.instance.text = text;
  }

}

export const defaultErrors = {
  required: `This field is required`,
  minlength: ({requiredLength, actualLength}) => `This field requires a minimum of ${requiredLength} characters`,
  maxlength: ({requiredLength, actualLength}) => `This field requires a maximum of ${requiredLength} characters`,
  min: ({min, actual}) => `Must be at least ${min}`,
  max: ({max, actual}) => `Must not exceed ${max}`,
  email: `This field requires a valid email`,
  confirmPassword: `Passwords must match`,
  minLengthArray: ({min, actual}) => `This field requires at least ${min} items`,
  unknown: `An unknown error has occurred.`
};

export const FORM_ERRORS = new InjectionToken('FORM_ERRORS', {
  providedIn: 'root',
  factory: () => defaultErrors
});
