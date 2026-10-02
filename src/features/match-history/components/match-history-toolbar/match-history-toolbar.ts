import {Component, input} from '@angular/core';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {AppToolbar} from '../../../../shared/components/app-toolbar/app-toolbar';

@Component({
  selector: 'app-match-history-toolbar',
  imports: [
    ThemeToggle,
    AppToolbar
  ],
  templateUrl: './match-history-toolbar.html',
  styleUrl: './match-history-toolbar.scss'
})
export class MatchHistoryToolbar {
  readonly loading = input.required<boolean>();
  readonly error = input<string | null>(null);

  protected readonly AppEndpoints = AppEndpoints;
}
