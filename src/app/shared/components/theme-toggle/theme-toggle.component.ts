import { Component, OnInit } from '@angular/core';
import {ThemeService} from '../../services/theme/theme-service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit {

  isDarkTheme$ = this.themeService.isDarkTheme;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

}
