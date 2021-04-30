import {Component} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private iconSet: { name: string, path: string }[] = [
    {name: 'lock', path: 'assets/lock.svg'},
    {name: 'darts', path: 'assets/darts.svg'},
    {name: 'logout', path: 'assets/logout.svg'}
  ];

  constructor(private matIconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    this.registerIcons();
  }

  private registerIcons() {
    this.iconSet.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.path));
    });
  }

}
