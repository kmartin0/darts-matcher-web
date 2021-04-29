import {
  Component,
  Input,
} from '@angular/core';

@Component({  template: `{{text}}`
})
export class FormControlErrorComponent {
  @Input() text: string;
}
