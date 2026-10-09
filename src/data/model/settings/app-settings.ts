import {DEFAULT_THEME_MODE, isThemeMode, ThemeMode} from './theme-mode';

export interface AppSettings {
  themeMode: ThemeMode;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  themeMode: DEFAULT_THEME_MODE
};

/**
 * Checks whether a value contains valid application settings.
 *
 * @param value - Value to check.
 * @returns Whether the value is valid application settings.
 */
export function isAppSettings(value: unknown): value is AppSettings {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const settings = value as Record<string, unknown>;

  return isThemeMode(settings['themeMode']);
}
