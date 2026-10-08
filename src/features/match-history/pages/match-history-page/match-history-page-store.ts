import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, defer, EMPTY, Subscription, tap} from 'rxjs';
import {ALL_API_ERROR_CODES} from '../../../../data/api/errors/api-error-code';
import {MatchHistoryItem} from '../../../../data/model/match-history/match-history-item';
import {MatchHistoryRepository} from '../../../../data/repository/match-history-repository';
import {LoadEvent} from '../../../../shared/types/load-event';
import {PaginationRequest} from '../../../../shared/types/pagination-request';
import {PaginationResponse} from '../../../../shared/types/pagination-response';
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

  /**
   * Observes the requested history page, replacing the previous observation.
   *
   * @param paginationRequest - Requested page index and page size.
   */
  loadMatchHistory(paginationRequest: PaginationRequest): void {
    this.matchHistorySubscription?.unsubscribe();
    this.patchState({navigateToPageIndex: null});

    this.matchHistorySubscription = this.matchHistoryRepository
      .getMatchHistoryPage$(paginationRequest, ALL_API_ERROR_CODES)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: event => this.handleMatchHistoryEvent(event),
        error: () => this.handleMatchHistoryError()
      });
  }

  /**
   * Removes a match from locally stored history when a history observation is active.
   *
   * Successful deletion result is streamed through the active match history observation.
   * Clears this operation's toolbar error on success and displays an error on failure.
   *
   * @param matchId - ID of the match to remove from history.
   */
  deleteFromHistory(matchId: string): void {
    if (this.matchHistorySubscription === null || this.matchHistorySubscription.closed) {
      return;
    }

    defer(() => this.matchHistoryRepository.deleteMatch(matchId)).pipe(
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
   * Clears the pending page navigation request.
   */
  clearPageNavigation(): void {
    this.patchState({navigateToPageIndex: null});
  }

  /**
   * Handles loading notifications and updated history pages.
   *
   * @param event - Load event emitted by the repository.
   */
  private handleMatchHistoryEvent(
    event: LoadEvent<PaginationResponse<MatchHistoryItem>>
  ): void {
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
   * Stores the history page or requests navigation to the last available page.
   *
   * Preserves the displayed page while an out-of-range selection is corrected.
   *
   * @param matchHistory - Paginated history returned by the repository.
   */
  private updateMatchHistory(matchHistory: PaginationResponse<MatchHistoryItem>): void {
    const lastPageIndex = Math.max(0, Math.ceil(matchHistory.totalElements / matchHistory.pageSize) - 1);

    if (matchHistory.pageIndex > lastPageIndex) {
      this.patchState({navigateToPageIndex: lastPageIndex, loading: true});
      return;
    }

    this.patchState({matchHistory: matchHistory, loading: false, navigateToPageIndex: null});
    this.clearToolbarError('matches');
  }

  /**
   * Resets the displayed history and reports an observation failure.
   */
  private handleMatchHistoryError(): void {
    this.patchState({
      ...INITIAL_MATCH_HISTORY_PAGE_STATE,
      toolbarError: {source: 'matches', message: 'Failed to load match history'}
    });
  }

  /**
   * Sets the toolbar error for the supplied source.
   *
   * @param source - Operation that owns the error.
   * @param message - Error message to display.
   */
  private setToolbarError(source: MatchHistoryToolbarErrorSource, message: string): void {
    this.patchState({toolbarError: {source: source, message: message}});
  }

  /**
   * Clears the toolbar error when it belongs to the supplied source.
   *
   * @param source - Error source permitted to clear the current error.
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
