import {isValidObjectId} from '../../api/utils/object-id.util';

/**
 * A locally stored match visit containing its ID and visit timestamp.
 * The full match is retrieved separately from the API.
 */
export interface StoredMatchHistoryItem {
  matchId: string;
  lastVisitedAt: number; // Unix timestamp in seconds
}

/**
 * Checks whether a value represents a valid stored match history item.
 *
 * @param value - Value to validate.
 * @returns Whether the value contains a valid match ID and visit timestamp.
 */
export function isStoredMatchHistoryItem(value: unknown): value is StoredMatchHistoryItem {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;
  const matchId = item['matchId'];
  const lastVisitedAt = item['lastVisitedAt'];

  return typeof matchId === 'string' &&
    isValidObjectId(matchId) &&
    typeof lastVisitedAt === 'number' &&
    Number.isSafeInteger(lastVisitedAt) &&
    lastVisitedAt >= 0;
}
