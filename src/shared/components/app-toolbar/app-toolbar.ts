import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ErrorMessage} from '../error-message/error-message';

@Component({
  selector: 'app-toolbar',
  imports: [
    RouterLink,
    MatToolbar,
    MatProgressSpinner,
    ErrorMessage
  ],
  templateUrl: './app-toolbar.html',
  styleUrl: './app-toolbar.scss'
})
export class AppToolbar {
  readonly title = input.required<string>();
  readonly titleLink = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly loading = input(false);
}
