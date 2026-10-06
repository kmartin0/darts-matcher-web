import {Component, inject} from '@angular/core';
import {MatchHistoryToolbar} from '../../components/match-history-toolbar/match-history-toolbar';
import {MatchHistoryCards} from '../../components/match-history-cards/match-history-cards';
import {MatchHistoryPageStore} from './match-history-page-store';
import {CommonDialogService} from '../../../../shared/services/common-dialog.service';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {PageError} from '../../../../shared/components/page-error/page-error';

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
  private readonly commonDialogService = inject(CommonDialogService);
  private readonly store = inject(MatchHistoryPageStore);

  protected readonly uiState = this.store.state;
  protected readonly pageSizeOptions = [5, 10, 25];

  /**
   * Removes a match from history after user confirmation.
   *
   * @param matchId - ID of the match to remove from history.
   */
  protected async onDeleteMatchFromHistory(matchId: string): Promise<void> {
    const result = await this.commonDialogService.openConfirmDialog('Remove match from history');

    if (result.status === 'dismissed') {
      return;
    }

    this.store.deleteFromHistory(matchId);
  }

  /**
   * Updates the pagination selection in the page store.
   *
   * @param event - Selected page index and page size.
   */
  protected onPageChange(event: PageEvent): void {
    this.store.setPage(event.pageIndex, event.pageSize);
  }
}
