import {Component, ElementRef, Input} from '@angular/core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-loading',
  template: `
    <div *ngIf="loading$ | async" class="spinner">
      <mat-spinner diameter="48"></mat-spinner>
    </div>
  `,
  styles: ['.spinner {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);}'],
})
export class LoadingComponent {

  @Input() loading$: Subject<boolean>;

  constructor(public elementRef: ElementRef) {
  }

}
