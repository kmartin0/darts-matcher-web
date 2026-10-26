/**
 * Identifies keydown events excluded from shortcut handling.
 *
 * Excludes already-handled events, repeated presses, text composition,
 * and presses with Ctrl, Alt, Meta, or Shift held.
 *
 * @param event - Keyboard event to check.
 * @returns Whether the event is excluded from shortcut handling.
 */
export function isNonShortcutKeyDown(event: KeyboardEvent): boolean {
  return event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.shiftKey;
}
