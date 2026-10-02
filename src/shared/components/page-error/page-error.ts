import {Component, input} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {AppEndpoints} from '../../../app/app-endpoints';

@Component({
  selector: 'app-page-error',
  imports: [
    MatButton,
    RouterLink
  ],
  templateUrl: './page-error.html',
  styleUrl: './page-error.scss'
})
export class PageError {
  readonly message = input.required<string>();
  readonly showHomeButton = input(false);

  protected readonly AppEndpoints = AppEndpoints;
}
