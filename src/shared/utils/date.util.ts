/**
 * Converts an epoch timestamp in seconds to a Date object.
 *
 * @param epochSeconds - Unix timestamp in seconds.
 * @returns Converted Date object, or null when the input is invalid.
 */
export function epochSecondsToDate(epochSeconds: number | null): Date | null {
  if (epochSeconds === null || Number.isNaN(epochSeconds)) {
    return null;
  }

  const date = new Date(epochSeconds * 1000);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

/**
 * Converts a Date to a Unix timestamp in whole seconds.
 *
 * @param date - Date to convert.
 * @returns Unix timestamp rounded down to whole seconds,
 * or null when the date is invalid.
 */
export function dateToEpochSeconds(date: Date): number | null {
  const epochMilliseconds = date.getTime();

  return Number.isNaN(epochMilliseconds)
    ? null
    : Math.floor(epochMilliseconds / 1000);
}
