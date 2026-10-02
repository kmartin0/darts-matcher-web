import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {catchError, defer, EMPTY, filter, map, Observable, of, switchMap, tap} from 'rxjs';
import {ALL_API_ERROR_CODES} from '../../../../data/api/errors/api-error-code';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchRepository} from '../../../../data/repository/match-repository';
import {RecentMatchEntry, RecentMatchesRepository} from '../../../../data/repository/recent-matches-repository';
import {
  INITIAL_MATCH_HISTORY_PAGE_STATE,
  MatchHistoryPageState,
  MatchHistoryToolbarErrorSource
} from './match-history-page-state';
import {MatchHistoryEntry} from '../../model/match-history-entry';

@Injectable()
export class MatchHistoryPageStore {
  private readonly matchRepository = inject(MatchRepository);
  private readonly recentMatchesRepository = inject(RecentMatchesRepository);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<MatchHistoryPageState>(
    INITIAL_MATCH_HISTORY_PAGE_STATE
  );
  readonly state = this._state.asReadonly();

  constructor() {
    this.registerRecentMatchesObserver();
  }

  /**
   * Removes a match from locally stored history.
   *
   * History changes reload the matches through the existing observation.
   * Clears this operation's toolbar error on success and displays an error when it fails.
   *
   * @param matchId - ID of the match to remove from history.
   */
  deleteFromHistory(matchId: string): void {
    defer(() => this.recentMatchesRepository.deleteMatch(matchId)).pipe(
      tap({
        complete: () => this.clearToolbarError('deleteFromHistory')
      }),
      catchError(() => {
        this.setToolbarError('deleteFromHistory', 'Failed to delete match from history');
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * Reloads match history whenever the locally stored recent entries change.
   *
   * Sets loading for the initial load only, keeping existing matches visible
   * during subsequent reloads. Sets the page and toolbar errors if observing
   * locally stored history fails.
   */
  private registerRecentMatchesObserver(): void {
    this.patchState({matches: {status: 'loading'}});

    toObservable(this.recentMatchesRepository.recentMatches)
      .pipe(
        filter(recentMatchEntries => recentMatchEntries !== undefined),
        switchMap(recentMatchEntries => this.getMatchHistoryEntries$(recentMatchEntries)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: matchHistoryEntries => {
          this.patchState({matches: {status: 'loaded', data: matchHistoryEntries}});
          this.clearToolbarError('matches');
        },
        error: () => {
          this.patchState({matches: {status: 'error'}});
          this.setToolbarError('matches', 'Failed to read locally stored match history');
        }
      });
  }

  /**
   * Retrieves matches for the recent entries and combines them with their
   * stored visit timestamps.
   *
   * On failure, sets the page error state and toolbar error, then completes
   * without emitting so the subscriber does not overwrite the error state.
   *
   * @param recentMatchEntries - Stored recent match entries.
   * @returns An observable emitting match history entries in API response order,
   * or an empty list when history is empty or no matching entries remain.
   */
  private getMatchHistoryEntries$(recentMatchEntries: RecentMatchEntry[]): Observable<MatchHistoryEntry[]> {
    if (recentMatchEntries.length === 0) {
      return of([]);
    }

    const recentMatchesMap = new Map(
      recentMatchEntries.map(recentMatchEntry => [recentMatchEntry.matchId, recentMatchEntry])
    );

    return this.matchRepository.getMatches([...recentMatchesMap.keys()], ALL_API_ERROR_CODES).pipe(
      map(matches => this.mapMatchHistoryEntries(matches, recentMatchesMap)),
      catchError(() => {
        this.patchState({matches: {status: 'error'}});
        this.setToolbarError('matches', 'Failed to load match history');
        return EMPTY;
      })
    );
  }

  /**
   * Combines fetched matches with their stored visit timestamps.
   *
   * Preserves API response order and omits matches without a recent entry.
   *
   * @param matches - Matches returned by the API.
   * @param recentMatchesMap - Stored recent entries keyed by match ID.
   * @returns Match history entries for matches with a corresponding recent entry.
   */
  private mapMatchHistoryEntries(matches: X01Match[], recentMatchesMap: Map<string, RecentMatchEntry>): MatchHistoryEntry[] {
    return matches.flatMap(match => {
      const recentMatchEntry = recentMatchesMap.get(match.id);

      if (recentMatchEntry === undefined) {
        return [];
      }

      return [{
        match,
        lastVisitedAt: recentMatchEntry.lastVisitedAt
      }];
    });
  }

  /**
   * Sets the toolbar error for the supplied source.
   *
   * @param source - Operation that owns the toolbar error.
   * @param message - Error message to display.
   */
  private setToolbarError(source: MatchHistoryToolbarErrorSource, message: string): void {
    this.patchState({
      toolbarError: {
        source: source,
        message: message
      }
    });
  }

  /**
   * Clears the toolbar error when it belongs to the supplied source.
   *
   * @param source - Error source permitted to clear the current toolbar error.
   */
  private clearToolbarError(source: MatchHistoryToolbarErrorSource): void {
    if (this._state().toolbarError?.source === source) {
      this.patchState({toolbarError: null});
    }
  }

  /**
   * Updates the current page state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<MatchHistoryPageState>): void {
    this._state.update(state => ({
      ...state,
      ...patch
    }));
  }
}
