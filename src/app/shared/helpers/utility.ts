// Utility function which returns a number array of a range. Both start and end are inclusive.
export function range(start: number, end: number): number[] {
  return Array.from({length: end - start + 1}, (v, k) => k + start);
}
