/**
 * Converts a URL page number to a zero-based page index.
 *
 * @param value - Raw page query parameter.
 * @param defaultPageIndex - Index used when the value is missing or invalid.
 * @returns Resolved page index.
 */
export function resolvePageIndex(value: unknown, defaultPageIndex = 0): number {
  if (typeof value !== 'string') {
    return defaultPageIndex;
  }

  const pageNumber = Number(value);

  return Number.isSafeInteger(pageNumber) && pageNumber > 0
    ? pageNumber - 1
    : defaultPageIndex;
}

/**
 * Resolves a URL page size to one of the supported sizes.
 *
 * @param value - Raw page size query parameter.
 * @param pageSizeOptions - Supported page sizes.
 * @param defaultPageSize - Size used when the value is missing or invalid.
 * @returns Resolved page size.
 */
export function resolvePageSize(value: unknown, pageSizeOptions: readonly number[], defaultPageSize: number): number {
  if (typeof value !== 'string') {
    return defaultPageSize;
  }

  const pageSize = Number(value);

  return pageSizeOptions.includes(pageSize)
    ? pageSize
    : defaultPageSize;
}
