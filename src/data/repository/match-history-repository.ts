import {inject, Injectable} from '@angular/core';
import {Dexie, liveQuery} from 'dexie';
import {defer, from, ignoreElements, map, Observable, of, startWith, switchMap} from 'rxjs';
import {LoadEvent} from '../../shared/types/load-event';
import {PaginationRequest} from '../../shared/types/pagination-request';
import {PaginationResponse} from '../../shared/types/pagination-response';
import {dateToEpochSeconds} from '../../shared/utils/date.util';
import {ApiErrorCodes} from '../api/errors/api-error-code';
import {isValidObjectId} from '../api/utils/object-id.util';
import {MatchHistoryItem} from '../model/match-history/match-history-item';
import {X01Match} from '../model/x01/match/x01-match';
import {MatchRepository} from './match-repository';

/**
 * A locally stored match visit containing its ID and visit timestamp.
 * The full match is retrieved separately from the API.
 */
interface MatchHistoryRecord {
  matchId: string;
  lastVisitedAt: number; // Unix timestamp in seconds
}

const MATCH_HISTORY_DB_NAME = 'darts-matcher-match-history';
const MATCH_HISTORY_TABLE_NAME = 'matchHistory';

/**
 * Persists local match visits and exposes history pages with loading notifications.
 *
 * Removes malformed records on database initialization and stored records
 * for matches omitted (not found) by successful API responses.
 */
@Injectable({providedIn: 'root'})
export class MatchHistoryRepository {
  private readonly matchRepository = inject(MatchRepository);

  private readonly database = this.createDatabase();
  private readonly matchHistoryTable =
    this.database.table<MatchHistoryRecord, string>(MATCH_HISTORY_TABLE_NAME);

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

    await this.matchHistoryTable.put({matchId: matchId, lastVisitedAt: visitedAt});
  }

  /**
   * Removes a match from locally stored history.
   *
   * @param matchId - Match ID to remove.
   * @returns Promise resolving when deletion completes.
   */
  deleteMatch(matchId: string): Promise<void> {
    return this.matchHistoryTable.delete(matchId);
  }

  /**
   * Observes a history page, emitting loading and data events as history changes.
   *
   * Missing match records are removed before emitting the refreshed page.
   * Database and API failures propagate through the observable's error channel.
   *
   * @param paginationRequest - Requested page index and page size.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable emitting loading notifications and paginated history items.
   */
  getMatchHistoryPage$(
    paginationRequest: PaginationRequest,
    handleLocally: ApiErrorCodes = []
  ): Observable<LoadEvent<PaginationResponse<MatchHistoryItem>>> {
    return defer(() => {
      this.validatePagination(paginationRequest);
      return this.getMatchHistoryRecords$(paginationRequest);
    }).pipe(
      switchMap(recordsPage =>
        this.getMatchHistoryPageFromRecords$(recordsPage, handleLocally).pipe(
          switchMap(page => this.resolveMatchHistoryPage$(recordsPage, page)),
          startWith<LoadEvent<PaginationResponse<MatchHistoryItem>>>({type: 'loading'})
        )
      ),
      startWith<LoadEvent<PaginationResponse<MatchHistoryItem>>>({type: 'loading'})
    );
  }

  /**
   * Observes stored history records ordered by most recently visited first.
   *
   * Reads the selected records and total count in one transaction.
   * Emits updated results when match history changes.
   *
   * @param paginationRequest - Requested page index and page size.
   * @returns Observable emitting a page of stored history records.
   */
  private getMatchHistoryRecords$(
    paginationRequest: PaginationRequest
  ): Observable<PaginationResponse<MatchHistoryRecord>> {
    return from(liveQuery(() =>
      this.database.transaction('r', this.matchHistoryTable, async () => {
        const totalElements = await this.matchHistoryTable.count();

        const records = await this.matchHistoryTable
          .orderBy('lastVisitedAt')
          .reverse()
          .offset(paginationRequest.pageIndex * paginationRequest.pageSize)
          .limit(paginationRequest.pageSize)
          .toArray();

        return {
          items: records,
          pageIndex: paginationRequest.pageIndex,
          pageSize: paginationRequest.pageSize,
          totalElements: totalElements
        };
      })
    ));
  }

  /**
   * Converts stored records into history items while retaining pagination information.
   *
   * @param recordsPage - Page of stored history records.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable emitting a history page that excludes missing matches.
   */
  private getMatchHistoryPageFromRecords$(
    recordsPage: PaginationResponse<MatchHistoryRecord>,
    handleLocally: ApiErrorCodes
  ): Observable<PaginationResponse<MatchHistoryItem>> {
    return this.getMatchHistoryItems$(recordsPage.items, handleLocally).pipe(
      map(items => ({
        items: items,
        pageIndex: recordsPage.pageIndex,
        pageSize: recordsPage.pageSize,
        totalElements: recordsPage.totalElements
      }))
    );
  }

  /**
   * Retrieves matches for stored history records and adds their visit timestamps.
   *
   * Empty records emit an empty array without an API request.
   * Matches omitted by the API are excluded from the result.
   *
   * @param records - Stored history records in the requested order.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable emitting history items for the existing matches.
   */
  private getMatchHistoryItems$(
    records: MatchHistoryRecord[],
    handleLocally: ApiErrorCodes
  ): Observable<MatchHistoryItem[]> {
    if (records.length === 0) {
      return of([]);
    }

    const recordsById = new Map(records.map(record => [record.matchId, record]));

    return this.matchRepository
      .getMatches([...recordsById.keys()], handleLocally)
      .pipe(map(matches => this.mapMatchHistoryItems(matches, recordsById)));
  }

  /**
   * Combines fetched matches with their stored visit timestamps.
   *
   * Preserves API response order and omits matches without a stored record.
   *
   * @param matches - Matches returned by the API in requested ID order.
   * @param recordsById - Stored history records keyed by match ID.
   * @returns Match history items with their visit timestamps.
   */
  private mapMatchHistoryItems(matches: X01Match[], recordsById: Map<string, MatchHistoryRecord>): MatchHistoryItem[] {
    return matches.flatMap(match => {
      const record = recordsById.get(match.id);

      if (record === undefined) {
        return [];
      }

      return [{match: match, lastVisitedAt: record.lastVisitedAt}];
    });
  }

  /**
   * Emits a data event when every requested record has a matching history item.
   * Otherwise, deletes missing match records and completes without emitting.
   *
   * @param recordsPage - Stored records used to request the matches.
   * @param page - Page resolved from the successful API response.
   * @returns Observable emitting a data event, or completing after cleanup.
   */
  private resolveMatchHistoryPage$(
    recordsPage: PaginationResponse<MatchHistoryRecord>,
    page: PaginationResponse<MatchHistoryItem>
  ): Observable<LoadEvent<PaginationResponse<MatchHistoryItem>>> {
    if (page.items.length === recordsPage.items.length) {
      return of({type: 'data', data: page});
    }

    return from(
      this.deleteMissingMatchRecords(recordsPage.items, page.items)
    ).pipe(ignoreElements());
  }

  /**
   * Deletes supplied history records whose matches are absent from the resolved items.
   *
   * @param records - Stored records used to request the matches.
   * @param items - History items resolved from the successful API response.
   * @returns Promise resolving when the missing records have been deleted.
   */
  private deleteMissingMatchRecords(records: MatchHistoryRecord[], items: MatchHistoryItem[]): Promise<void> {
    const existingMatchIds = new Set(items.map(item => item.match.id));

    const missingMatchIds = records
      .filter(record => !existingMatchIds.has(record.matchId))
      .map(record => record.matchId);

    return this.matchHistoryTable.bulkDelete(missingMatchIds);
  }

  /**
   * Configures the database schema and registers initialization cleanup.
   *
   * The database opens automatically on the first database operation.
   * Operations wait for the registered cleanup to finish.
   *
   * @returns The configured database.
   */
  private createDatabase(): Dexie {
    const database = new Dexie(MATCH_HISTORY_DB_NAME);

    database.version(1).stores({
      [MATCH_HISTORY_TABLE_NAME]: 'matchId, lastVisitedAt'
    });

    database.on('ready', initializationDatabase => this.cleanMatchHistoryTable(initializationDatabase));

    return database;
  }

  /**
   * Removes malformed visit records from the supplied database.
   *
   * @param database - Database containing the match history table.
   * @returns Promise resolving when cleanup completes.
   */
  private async cleanMatchHistoryTable(database: Dexie): Promise<void> {
    await database
      .table<MatchHistoryRecord, string>(MATCH_HISTORY_TABLE_NAME)
      .filter(record => !this.isMatchHistoryRecord(record))
      .delete();
  }

  /**
   * Validates the requested pagination values.
   *
   * @param paginationRequest - Requested page index and page size.
   * @throws RangeError when either value is outside its permitted range.
   */
  private validatePagination(paginationRequest: PaginationRequest): void {
    if (!Number.isSafeInteger(paginationRequest.pageIndex) || paginationRequest.pageIndex < 0) {
      throw new RangeError('pageIndex must be a non-negative safe integer');
    }

    if (!Number.isSafeInteger(paginationRequest.pageSize) || paginationRequest.pageSize <= 0) {
      throw new RangeError('pageSize must be a positive safe integer');
    }
  }

  /**
   * Checks whether a stored value represents a valid match visit.
   *
   * @param value - Stored value to validate.
   * @returns Whether the value contains a valid match ID and visit timestamp.
   */
  private isMatchHistoryRecord(value: unknown): value is MatchHistoryRecord {
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
