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

/**
 * Calculates the number of pages needed for the supplied total.
 *
 * @param totalElements - Total elements, or undefined before data is available.
 * @param pageSize - Positive number of elements per page.
 * @returns Page count, or zero when the total is missing or empty.
 */
export function getPageCount(totalElements: number | undefined, pageSize: number): number {
  return Math.ceil((totalElements ?? 0) / pageSize);
}

/**
 * Calculates the last available zero-based page index.
 *
 * @param totalElements - Total elements, or undefined before data is available.
 * @param pageSize - Positive number of elements per page.
 * @returns Last page index, or zero when the total is missing or empty.
 */
export function getLastPageIndex(totalElements: number | undefined, pageSize: number): number {
  return Math.max(0, getPageCount(totalElements, pageSize) - 1);
}
