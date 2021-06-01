// Utility function which returns a number array of a range. Both start and end are inclusive.
export function range(start: number, end: number): number[] {
  return Array.from({length: end - start + 1}, (v, k) => k + start);
}

export function humanizeDuration(milliseconds: number): string {
  const dayInMs = 86400000;
  const hourInMs = 3600000;
  const minuteInMs = 60000;

  const days = Math.floor(milliseconds / dayInMs);
  const hours = Math.floor((milliseconds % dayInMs) / hourInMs);
  const minutes = Math.round(((milliseconds % dayInMs) % hourInMs) / minuteInMs);

  let duration = '';

  if (days) duration = duration.concat(`${days} Day(s) `);
  if (hours) duration = duration.concat(`${hours} Hour(s) `);
  if (minutes) duration = duration.concat(`${minutes} Minute(s) `);

  return duration;
}

