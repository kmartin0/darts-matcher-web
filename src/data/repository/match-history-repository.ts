import {inject, Injectable} from '@angular/core';
import {liveQuery} from 'dexie';
import {defer, from, ignoreElements, map, Observable, of, startWith, switchMap} from 'rxjs';
import {LoadEvent} from '../../shared/types/load-event';
import {PaginationRequest} from '../../shared/types/pagination-request';
import {PaginationResponse} from '../../shared/types/pagination-response';
import {dateToEpochSeconds} from '../../shared/utils/date.util';
import {ApiErrorCodes} from '../api/errors/api-error-code';
import {isValidObjectId} from '../api/utils/object-id.util';
import {AppLocalDatabase} from '../local/app-local-database';
import {MatchHistoryItem} from '../model/match-history/match-history-item';
import {StoredMatchHistoryItem} from '../model/match-history/stored-match-history-item';
import {X01Match} from '../model/x01/match/x01-match';
import {MatchRepository} from './match-repository';

/**
 * Records local match visits and exposes history pages with loading notifications.
 *
 * Combines stored history items with matches retrieved from the API.
 * Removes stored items for matches omitted (not found) by successful API responses.
 */
@Injectable({providedIn: 'root'})
export class MatchHistoryRepository {
  private readonly matchRepository = inject(MatchRepository);
  private readonly localDatabase = inject(AppLocalDatabase);

  private readonly matchHistoryTable = this.localDatabase.tables.matchHistory;

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

    await this.matchHistoryTable.put({
      matchId: matchId,
      lastVisitedAt: visitedAt
    });
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
   * Stored items for missing matches are removed before emitting the refreshed page.
   * Pagination validation, database and API failures use the observable's error channel.
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
      return this.getStoredMatchHistoryPage$(paginationRequest);
    }).pipe(
      switchMap(storedPage =>
        this.getMatchHistoryPageFromStoredItems$(storedPage, handleLocally).pipe(
          switchMap(page => this.resolveMatchHistoryPage$(storedPage, page)),
          startWith<LoadEvent<PaginationResponse<MatchHistoryItem>>>({type: 'loading'})
        )
      ),
      startWith<LoadEvent<PaginationResponse<MatchHistoryItem>>>({type: 'loading'})
    );
  }

  /**
   * Observes stored history items ordered by most recently visited first.
   *
   * Reads the selected items and total count in one transaction.
   * Emits updated results when match history changes.
   *
   * @param paginationRequest - Requested page index and page size.
   * @returns Observable emitting a page of stored history items.
   */
  private getStoredMatchHistoryPage$(
    paginationRequest: PaginationRequest
  ): Observable<PaginationResponse<StoredMatchHistoryItem>> {
    return from(liveQuery(() =>
      this.localDatabase.transaction('r', this.matchHistoryTable, async () => {
        const totalElements = await this.matchHistoryTable.count();

        const items = await this.matchHistoryTable
          .orderBy('lastVisitedAt')
          .reverse()
          .offset(paginationRequest.pageIndex * paginationRequest.pageSize)
          .limit(paginationRequest.pageSize)
          .toArray();

        return {
          items: items,
          pageIndex: paginationRequest.pageIndex,
          pageSize: paginationRequest.pageSize,
          totalElements: totalElements
        };
      })
    ));
  }

  /**
   * Converts stored items into history items while retaining pagination information.
   *
   * @param storedPage - Page of stored history items.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable emitting a history page that excludes missing matches.
   */
  private getMatchHistoryPageFromStoredItems$(
    storedPage: PaginationResponse<StoredMatchHistoryItem>,
    handleLocally: ApiErrorCodes
  ): Observable<PaginationResponse<MatchHistoryItem>> {
    return this.getMatchHistoryItems$(storedPage.items, handleLocally).pipe(
      map(items => ({
        items: items,
        pageIndex: storedPage.pageIndex,
        pageSize: storedPage.pageSize,
        totalElements: storedPage.totalElements
      }))
    );
  }

  /**
   * Retrieves matches for stored history items and adds their visit timestamps.
   *
   * Empty stored items emit an empty array without an API request.
   * Matches omitted by the API are excluded from the result.
   *
   * @param storedItems - Stored history items in the requested order.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable emitting history items for the existing matches.
   */
  private getMatchHistoryItems$(
    storedItems: StoredMatchHistoryItem[],
    handleLocally: ApiErrorCodes
  ): Observable<MatchHistoryItem[]> {
    if (storedItems.length === 0) {
      return of([]);
    }

    const storedItemsById = new Map(storedItems.map(item => [item.matchId, item]));

    return this.matchRepository
      .getMatches([...storedItemsById.keys()], handleLocally)
      .pipe(map(matches => this.mapMatchHistoryItems(matches, storedItemsById)));
  }

  /**
   * Combines fetched matches with their stored visit timestamps.
   *
   * Preserves API response order and omits matches without a stored item.
   *
   * @param matches - Matches returned by the API in requested ID order.
   * @param storedItemsById - Stored history items keyed by match ID.
   * @returns Match history items with their visit timestamps.
   */
  private mapMatchHistoryItems(
    matches: X01Match[],
    storedItemsById: Map<string, StoredMatchHistoryItem>
  ): MatchHistoryItem[] {
    return matches.flatMap(match => {
      const storedItem = storedItemsById.get(match.id);

      if (storedItem === undefined) {
        return [];
      }

      return [{match: match, lastVisitedAt: storedItem.lastVisitedAt}];
    });
  }

  /**
   * Emits a data event when every requested stored item has a matching history item.
   * Otherwise, deletes stored items for missing matches and completes without emitting.
   *
   * @param storedPage - Stored items used to request the matches.
   * @param page - Page resolved from the successful API response.
   * @returns Observable emitting a data event, or completing after cleanup.
   */
  private resolveMatchHistoryPage$(
    storedPage: PaginationResponse<StoredMatchHistoryItem>,
    page: PaginationResponse<MatchHistoryItem>
  ): Observable<LoadEvent<PaginationResponse<MatchHistoryItem>>> {
    if (page.items.length === storedPage.items.length) {
      return of({type: 'data', data: page});
    }

    return from(
      this.deleteMissingMatchItems(storedPage.items, page.items)
    ).pipe(ignoreElements());
  }

  /**
   * Deletes supplied stored items whose matches are absent from the resolved items.
   *
   * @param storedItems - Stored history items used to request the matches.
   * @param items - History items resolved from the successful API response.
   * @returns Promise resolving when the stored items for missing matches have been deleted.
   */
  private deleteMissingMatchItems(
    storedItems: StoredMatchHistoryItem[],
    items: MatchHistoryItem[]
  ): Promise<void> {
    const existingMatchIds = new Set(items.map(item => item.match.id));

    const missingMatchIds = storedItems
      .filter(item => !existingMatchIds.has(item.matchId))
      .map(item => item.matchId);

    return this.matchHistoryTable.bulkDelete(missingMatchIds);
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
}
