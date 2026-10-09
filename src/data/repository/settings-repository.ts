import {computed, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AppLocalStorage} from '../local/app-local-storage';
import {AppSettings} from '../model/settings/app-settings';
import {ThemeMode} from '../model/settings/theme-mode';

/**
 * Repository responsible for application settings.
 *
 * Owns the reactive settings state and synchronizes persisted preferences
 * with local storage, including changes made in other tabs.
 */
@Injectable({providedIn: 'root'})
export class SettingsRepository {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appLocalStorage = inject(AppLocalStorage);
  private readonly appSettingsEntry = this.appLocalStorage.entries.appSettings;

  private readonly _settings = signal<AppSettings>(
    this.appLocalStorage.getValue(this.appSettingsEntry)
  );


  readonly themeMode = computed<ThemeMode>(() => this._settings().themeMode);

  constructor() {
    this.appLocalStorage.getValueChanges$(this.appSettingsEntry)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(settings => this._settings.set(settings));
  }

  /**
   * Saves and applies the selected theme mode.
   *
   * @param themeMode - Theme mode to use.
   * @throws When the theme mode cannot be saved.
   */
  setThemeMode(themeMode: ThemeMode): void {
    this.setSettings({...this._settings(), themeMode: themeMode});
  }

  /**
   * Switches between light and dark theme mode and saves the selection.
   *
   * @throws When the theme mode cannot be saved.
   */
  toggleThemeMode(): void {
    const nextThemeMode = this.themeMode() === ThemeMode.LIGHT
      ? ThemeMode.DARK
      : ThemeMode.LIGHT;

    this.setThemeMode(nextThemeMode);
  }

  /**
   * Persists settings. Successful saves update the state through the storage subscription.
   *
   * @param settings - Application settings to save.
   * @throws When the settings cannot be saved.
   */
  private setSettings(settings: AppSettings): void {
    this.appLocalStorage.saveValue(this.appSettingsEntry, settings);
  }
}
