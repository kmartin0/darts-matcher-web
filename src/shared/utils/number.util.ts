/**
 * Formats a count with its matching singular or plural label.
 *
 * @param count - Count to format.
 * @param singular - Label used when the count is 1.
 * @param plural - Label used for any other count.
 * @returns Count followed by the matching label.
 */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
