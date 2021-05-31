import {Component} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ThemeService} from '../../shared/services/theme/theme-service';

// TODO: Match Summary https://recap.dartconnect.com/history/report/match/608845ae631d920bf98a2794
// TODO: Match Detail https://recap.dartconnect.com/history/report/games/match/608845ae631d920bf98a2794
// TODO: Match Information (e.g. players, SIDO, X01, Best Of (Sets, Legs).
// TODO: Dart Bot separate averages for each bot.
// TODO: Api Error Handling.
// TODO: Api Unauthorized handling (refresh token, forbidden etc.)
// TODO: Dart bot tooltip (info bot will average each leg + avg to darts conversion table)
// TODO: Redirect buttons should be able to ctrl+click to open in new tab
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
