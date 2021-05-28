import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appLoseFocusAfterClick]'
})
export class LoseFocusAfterClickDirective {

  constructor(private elRef: ElementRef) {
  }

  @HostListener('click') onClick() {
    this.elRef.nativeElement.blur();
  }

}
