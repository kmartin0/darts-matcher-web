import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {OverlayContainer} from '@angular/cdk/overlay';
import {Meta} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _darkTheme = new BehaviorSubject<boolean>(this.getThemeFromStorage());
  isDarkTheme = this._darkTheme.asObservable();

  defaultThemeClass = 'theme-default';
  darkThemeClass = 'theme-dark';

  constructor(private overlayContainer: OverlayContainer, private meta: Meta) {
    this.initDarkThemeObserver();
  }

  toggleTheme(): void {
    this._darkTheme.next(!this._darkTheme.value);
  }

  private initDarkThemeObserver() {
    this.isDarkTheme.subscribe(isDarkTheme => {
      const overlayContainerClasses = this.overlayContainer.getContainerElement().classList;
      const themeClassesToRemove = Array.from(overlayContainerClasses).filter((item: string) => item.startsWith('theme-'));

      if (themeClassesToRemove.length) {
        overlayContainerClasses.remove(...themeClassesToRemove);
      }

      overlayContainerClasses.add(isDarkTheme ? this.darkThemeClass : this.defaultThemeClass);
      this.meta.updateTag({name: 'theme-color', content: isDarkTheme ? '#000000' : '#FFFFFF'});
      this.persistTheme(isDarkTheme);

    });
  }

  private persistTheme(isDarkTheme: boolean) {
    localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(isDarkTheme));
  }

  private getThemeFromStorage(): boolean {
    return JSON.parse(localStorage.getItem(STORAGE_THEME_KEY));
  }

}

export const STORAGE_THEME_KEY = 'dark-theme';
