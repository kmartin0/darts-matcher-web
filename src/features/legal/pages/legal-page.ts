import {Component} from '@angular/core';
import {AppToolbar} from '../../../shared/components/app-toolbar/app-toolbar';
import {ThemeToggle} from '../../../shared/components/theme-toggle/theme-toggle';
import {AppEndpoints} from '../../../app/app-endpoints';


@Component({
  selector: 'app-legal-page',
  imports: [
    AppToolbar,
    ThemeToggle
  ],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss'
})
export class LegalPage {
  protected readonly AppEndpoints = AppEndpoints;
}
