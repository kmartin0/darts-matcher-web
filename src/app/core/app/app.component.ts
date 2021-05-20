import {Component} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ThemeService} from '../../shared/services/theme/theme-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isDarkTheme$ = this.themeService.isDarkTheme;

  private iconSet: { name: string, path: string }[] = [
    {name: 'lock', path: 'assets/lock.svg'},
    {name: 'darts', path: 'assets/darts.svg'},
    {name: 'logout', path: 'assets/logout.svg'}
  ];

  constructor(private matIconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private themeService: ThemeService) {
    this.registerIcons();
  }

  private registerIcons() {
    this.iconSet.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.path));
    });
  }

}
