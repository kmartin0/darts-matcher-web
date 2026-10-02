import {Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Dexie, liveQuery} from 'dexie';
import {defer, from, Observable, switchMap} from 'rxjs';
import {isValidObjectId} from '../api/utils/object-id.util';
import {dateToEpochSeconds} from '../../shared/utils/date.util';

const RECENT_MATCHES_DB_NAME = 'darts-matcher-recent-matches';

export interface RecentMatchEntry {
  matchId: string;
  lastVisitedAt: number; // Unix timestamp in seconds
}

/**
 * Persists recently visited matches and exposes their entries
 * in most recently visited order.
 *
 * Observes changes through Dexie, including changes made in other tabs.
 */
@Injectable({providedIn: 'root'})
export class RecentMatchesRepository {
  private readonly database = this.createDatabase();
  private readonly recentMatchesTable =
    this.database.table<RecentMatchEntry, string>('recentMatches');

  readonly recentMatches = toSignal(this.observeRecentMatches$());

  /**
   * Records a match visit using the current timestamp.
   *
   * Invalid IDs or an invalid current date are ignored.
   * Revisiting an existing match updates its visit timestamp.
   *
   * @param matchId - Match ID to record.
   * @returns Promise resolving when the visit is persisted or ignored.
   */
  async addMatch(matchId: string): Promise<void> {
    if (!isValidObjectId(matchId)) {
      return;
    }

    const visitedAt = dateToEpochSeconds(new Date());
    if (visitedAt === null) {
      return;
    }

    await this.recentMatchesTable.put({matchId, lastVisitedAt: visitedAt});
  }

  /**
   * Removes a match from recently visited matches.
   *
   * @param matchId - Match ID to remove.
   * @returns Promise resolving when deletion completes.
   */
  deleteMatch(matchId: string): Promise<void> {
    return this.recentMatchesTable.delete(matchId);
  }

  /**
   * Creates the database instance and configures its schema.
   *
   * @returns The configured database.
   */
  private createDatabase(): Dexie {
    const database = new Dexie(RECENT_MATCHES_DB_NAME);

    database.version(1).stores({
      recentMatches: 'matchId, lastVisitedAt'
    });

    return database;
  }

  /**
   * Cleans stored records before observing recently visited match entries.
   *
   * @returns Observable emitting entries ordered by most recently visited first.
   */
  private observeRecentMatches$(): Observable<RecentMatchEntry[]> {
    return defer(() => this.cleanRecentMatches()).pipe(
      switchMap(() => from(liveQuery(() =>
        this.recentMatchesTable
          .orderBy('lastVisitedAt')
          .reverse()
          .toArray()
      )))
    );
  }

  /**
   * Removes malformed visit records before observing recent matches.
   *
   * @returns Promise resolving when cleanup completes.
   */
  private async cleanRecentMatches(): Promise<void> {
    await this.database.transaction('rw', this.recentMatchesTable, async () => {
      await this.recentMatchesTable
        .filter(recentMatch => !this.isRecentMatchEntry(recentMatch))
        .delete();
    });
  }

  /**
   * Checks whether a stored value represents a valid match visit.
   *
   * @param value - Stored value to validate.
   * @returns Whether the value contains a valid match ID and visit timestamp.
   */
  private isRecentMatchEntry(value: unknown): value is RecentMatchEntry {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    const record = value as Record<string, unknown>;
    const matchId = record['matchId'];
    const lastVisitedAt = record['lastVisitedAt'];

    return typeof matchId === 'string' &&
      isValidObjectId(matchId) &&
      typeof lastVisitedAt === 'number' &&
      Number.isSafeInteger(lastVisitedAt) &&
      lastVisitedAt >= 0;
  }
}
