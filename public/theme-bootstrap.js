/**
 * Applies the persisted application theme before Angular initializes.
 *
 * Keep the values in sync with their Angular counterparts:
 * - STORAGE_KEY mirrors SettingsRepository.
 * - DEFAULT_THEME_MODE mirrors DEFAULT_THEME_MODE from theme-mode.ts.
 * - THEME_MODE_BODY_CLASSES mirrors THEME_MODE_BODY_CLASSES from theme-mode.ts.
 *
 * Prevents a flash of the default theme when persisted theme settings exist.
 */
(function () {
  const STORAGE_KEY = 'darts-matcher:app-settings';
  const DEFAULT_THEME_MODE = 'light';

  const THEME_MODE_BODY_CLASSES = {
    light: 'theme-mode-light',
    dark: 'theme-mode-dark'
  };

  function loadSettings() {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      const settings = storedSettings === null ? null : JSON.parse(storedSettings);

      return settings !== null && typeof settings === 'object' && !Array.isArray(settings) ? settings : null;
    } catch {
      return null;
    }
  }

  function applyTheme(themeMode) {
    const validThemeMode = typeof themeMode === 'string' &&
    Object.prototype.hasOwnProperty.call(THEME_MODE_BODY_CLASSES, themeMode)
      ? themeMode
      : DEFAULT_THEME_MODE;

    document.body.classList.remove(...Object.values(THEME_MODE_BODY_CLASSES));
    document.body.classList.add(THEME_MODE_BODY_CLASSES[validThemeMode]);
  }

  const settings = loadSettings();

  applyTheme(settings?.themeMode);
})();
