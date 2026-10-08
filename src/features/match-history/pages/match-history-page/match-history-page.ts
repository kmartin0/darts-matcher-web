import {Component, computed, DestroyRef, inject, input, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PageError} from '../../../../shared/components/page-error/page-error';
import {CommonDialogService} from '../../../../shared/services/common-dialog.service';
import {PaginationRequest} from '../../../../shared/types/pagination-request';
import {resolvePageIndex, resolvePageSize} from '../../../../shared/utils/pagination.util';
import {observeSignalProperty} from '../../../../shared/utils/signal.util';
import {MatchHistoryCards} from '../../components/match-history-cards/match-history-cards';
import {MatchHistoryToolbar} from '../../components/match-history-toolbar/match-history-toolbar';
import {MatchHistoryPageStore} from './match-history-page-store';

export const PAGE_INDEX_QUERY_PARAM = 'page';
export const PAGE_SIZE_QUERY_PARAM = 'pageSize';

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, 10, 25];

@Component({
  selector: 'app-match-history-page',
  providers: [MatchHistoryPageStore],
  imports: [
    MatchHistoryToolbar,
    MatchHistoryCards,
    MatPaginator,
    PageError
  ],
  templateUrl: './match-history-page.html',
  styleUrl: './match-history-page.scss'
})
export class MatchHistoryPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly commonDialogService = inject(CommonDialogService);
  private readonly store = inject(MatchHistoryPageStore);

  readonly pageIndex = input(DEFAULT_PAGE_INDEX, {
    alias: 'page',
    transform: (value: unknown) => resolvePageIndex(value, DEFAULT_PAGE_INDEX)
  });

  readonly pageSize = input(DEFAULT_PAGE_SIZE, {
    alias: 'pageSize',
    transform: (value: unknown) => resolvePageSize(value, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE)
  });

  protected readonly uiState = this.store.state;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected readonly paginationRequest = computed<PaginationRequest>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize()
  }));

  constructor() {
    this.registerQueryParamsObserver();
    this.registerPaginationRequestObserver();
    this.registerNavigateToPageIndexObserver();
  }

  /**
   * Removes a match from history after user confirmation.
   *
   * @param matchId - ID of the match to remove from history.
   */
  protected async onDeleteMatchFromHistory(matchId: string): Promise<void> {
    const result = await this.commonDialogService.openConfirmDialog(
      'Remove match from history'
    );

    if (result.status === 'dismissed') {
      return;
    }

    this.store.deleteFromHistory(matchId);
  }

  /**
   * Navigates to the pagination selection made through the paginator.
   *
   * @param event - Selected page index and page size.
   */
  protected onPageChange(event: PageEvent): void {
    this.navigateToPage({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  /**
   * Observes query parameters and corrects pagination URLs when needed.
   */
  private registerQueryParamsObserver(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryParams => {
        if (this.isQueryParamsNormalized(queryParams)) {
          return;
        }

        const paginationRequest = this.createPaginationRequest(queryParams);
        this.navigateToPage(paginationRequest, true);
      });
  }

  /**
   * Loads history when the requested page index or page size changes.
   */
  private registerPaginationRequestObserver(): void {
    observeSignalProperty(
      () => this.paginationRequest(),
      paginationRequest => {
        untracked(() => this.store.loadMatchHistory(paginationRequest));
      }
    );
  }

  /**
   * Applies requested page corrections without adding a browser history entry.
   */
  private registerNavigateToPageIndexObserver(): void {
    observeSignalProperty(
      () => this.uiState().navigateToPageIndex,
      pageIndex => {
        if (pageIndex === null) {
          return;
        }

        untracked(() => {
          this.store.clearPageNavigation();
          this.navigateToPage({pageIndex: pageIndex, pageSize: this.pageSize()}, true);
        });
      }
    );
  }

  /**
   * Checks whether pagination query parameters are normalized and omit defaults.
   *
   * @param queryParams - Raw query parameters from the route.
   * @returns Whether the pagination parameters need no URL correction.
   */
  private isQueryParamsNormalized(queryParams: Params): boolean {
    const pageIndex = resolvePageIndex(queryParams[PAGE_INDEX_QUERY_PARAM], DEFAULT_PAGE_INDEX);
    const pageSize = resolvePageSize(queryParams[PAGE_SIZE_QUERY_PARAM], PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);

    const normalizedPage = pageIndex === DEFAULT_PAGE_INDEX ? undefined : String(pageIndex + 1);
    const normalizedPageSize = pageSize === DEFAULT_PAGE_SIZE ? undefined : String(pageSize);

    return queryParams[PAGE_INDEX_QUERY_PARAM] === normalizedPage &&
      queryParams[PAGE_SIZE_QUERY_PARAM] === normalizedPageSize;
  }

  /**
   * Resolves pagination query parameters into a pagination request.
   *
   * @param queryParams - Raw query parameters from the route.
   * @returns Pagination request using defaults for missing or invalid values.
   */
  private createPaginationRequest(queryParams: Params): PaginationRequest {
    return {
      pageIndex: resolvePageIndex(queryParams[PAGE_INDEX_QUERY_PARAM], DEFAULT_PAGE_INDEX),
      pageSize: resolvePageSize(queryParams[PAGE_SIZE_QUERY_PARAM], PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE)
    };
  }

  /**
   * Updates the pagination query parameters, omitting default values.
   *
   * @param paginationRequest - Requested page index and page size.
   * @param replaceUrl - Whether to replace the current browser history entry.
   */
  private navigateToPage(paginationRequest: PaginationRequest, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [PAGE_INDEX_QUERY_PARAM]: paginationRequest.pageIndex === DEFAULT_PAGE_INDEX
          ? null
          : paginationRequest.pageIndex + 1,
        [PAGE_SIZE_QUERY_PARAM]: paginationRequest.pageSize === DEFAULT_PAGE_SIZE
          ? null
          : paginationRequest.pageSize
      },
      queryParamsHandling: 'merge',
      replaceUrl: replaceUrl
    });
  }
}
