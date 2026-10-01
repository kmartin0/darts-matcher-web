/**
 * Available application theme modes.
 */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export const DEFAULT_THEME_MODE: ThemeMode = ThemeMode.LIGHT;

export const THEME_MODE_BODY_CLASSES: Readonly<Record<ThemeMode, string>> =
  Object.freeze({
    [ThemeMode.LIGHT]: 'theme-mode-light',
    [ThemeMode.DARK]: 'theme-mode-dark'
  });

/**
 * Checks whether a value is a supported theme mode.
 *
 * @param value - Value to check.
 * @returns Whether the value is a supported theme mode.
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === ThemeMode.LIGHT || value === ThemeMode.DARK;
}
