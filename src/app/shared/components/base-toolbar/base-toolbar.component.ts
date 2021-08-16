import {Component, Input, OnInit} from '@angular/core';
import {ThemeService} from '../../services/theme/theme-service';

@Component({
  selector: 'app-base-toolbar',
  templateUrl: './base-toolbar.component.html',
  styleUrls: ['./base-toolbar.component.scss']
})
export class BaseToolbarComponent implements OnInit {

  isDarkTheme$ = this.themeService.isDarkTheme;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit(): void {
  }

}
