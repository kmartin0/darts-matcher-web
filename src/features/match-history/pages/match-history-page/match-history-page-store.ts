import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, defer, EMPTY, Subscription, tap} from 'rxjs';
import {ALL_API_ERROR_CODES} from '../../../../data/api/errors/api-error-code';
import {MatchHistoryPage} from '../../../../data/model/match-history/match-history-page';
import {MatchHistoryRepository} from '../../../../data/repository/match-history-repository';
import {LoadEvent} from '../../../../shared/types/load-event';
import {
  INITIAL_MATCH_HISTORY_PAGE_STATE,
  MatchHistoryPageState,
  MatchHistoryToolbarErrorSource
} from './match-history-page-state';

@Injectable()
export class MatchHistoryPageStore {
  private readonly matchHistoryRepository = inject(MatchHistoryRepository);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<MatchHistoryPageState>(
    INITIAL_MATCH_HISTORY_PAGE_STATE
  );
  readonly state = this._state.asReadonly();

  private matchHistorySubscription: Subscription | null = null;

  constructor() {
    this.loadMatchHistory();
  }

  /**
   * Removes a match from locally stored history.
   *
   * Successful deletions update the active observation or restart it if it ended.
   * Clears this operation's toolbar error on success and displays an error on failure.
   *
   * @param matchId - ID of the match to remove from history.
   */
  deleteFromHistory(matchId: string): void {
    defer(() => this.matchHistoryRepository.deleteMatch(matchId)).pipe(
      tap({
        complete: () => {
          this.clearToolbarError('deleteFromHistory');

          if (this.matchHistorySubscription === null || this.matchHistorySubscription.closed) {
            this.loadMatchHistory();
          }
        }
      }),
      catchError(() => {
        this.setToolbarError('deleteFromHistory', 'Failed to delete match from history');
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * Selects and loads a history page.
   *
   * Replaces the previous history observation.
   * Selecting the same page again also starts a new observation.
   *
   * @param pageIndex - Zero-based page index.
   * @param pageSize - Maximum number of history entries per page.
   */
  setPage(pageIndex: number, pageSize: number): void {
    this.patchState({pageIndex: pageIndex, pageSize: pageSize});
    this.loadMatchHistory();
  }

  /**
   * Observes history for the currently selected page.
   *
   * Replaces the previous subscription and handles loading, data, and failures.
   */
  private loadMatchHistory(): void {
    this.matchHistorySubscription?.unsubscribe();

    const state = this._state();

    this.matchHistorySubscription = this.matchHistoryRepository
      .getMatchHistoryPage$(state.pageIndex, state.pageSize, ALL_API_ERROR_CODES)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: event => this.handleMatchHistoryEvent(event),
        error: () => this.handleMatchHistoryError()
      });
  }

  /**
   * Handles a loading notification or an updated history page.
   *
   * Loading notifications activate the indicator while preserving displayed entries.
   *
   * @param event - Load event emitted by the history repository.
   */
  private handleMatchHistoryEvent(event: LoadEvent<MatchHistoryPage>): void {
    switch (event.type) {
      case 'loading':
        this.patchState({loading: true});
        break;

      case 'data':
        this.updateMatchHistory(event.data);
        break;
    }
  }

  /**
   * Applies history entries and pagination metadata, then stops loading.
   *
   * If the requested page is beyond the available records, loads the last
   * available page before replacing the displayed entries.
   *
   * @param matchHistory - History page returned by the repository.
   */
  private updateMatchHistory(matchHistory: MatchHistoryPage): void {
    const pageMetadata = matchHistory.pageMetaData;
    const lastPageIndex = Math.max(0, Math.ceil(pageMetadata.totalItems / pageMetadata.size) - 1);

    if (pageMetadata.index > lastPageIndex) {
      this.patchState({totalMatches: pageMetadata.totalItems});
      this.setPage(lastPageIndex, pageMetadata.size);
      return;
    }

    this.patchState({
      matches: matchHistory.entries,
      loading: false,
      pageIndex: pageMetadata.index,
      pageSize: pageMetadata.size,
      totalMatches: pageMetadata.totalItems
    });
    this.clearToolbarError('matches');
  }

  /**
   * Resets the page to its initial state and reports a failure to load the match history.
   */
  private handleMatchHistoryError(): void {
    this.patchState({
      ...INITIAL_MATCH_HISTORY_PAGE_STATE,
      toolbarError: {
        source: 'matches',
        message: 'Failed to load match history'
      }
    });
  }

  /**
   * Sets the toolbar error for the supplied source.
   *
   * @param source - Operation that owns the toolbar error.
   * @param message - Error message to display.
   */
  private setToolbarError(source: MatchHistoryToolbarErrorSource, message: string): void {
    this.patchState({toolbarError: {source: source, message: message}});
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
