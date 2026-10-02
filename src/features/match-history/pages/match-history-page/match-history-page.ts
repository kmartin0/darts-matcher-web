import {Component, computed, inject} from '@angular/core';
import {MatchHistoryToolbar} from '../../components/match-history-toolbar/match-history-toolbar';
import {MatchHistoryCards} from '../../components/match-history-cards/match-history-cards';
import {MatchHistoryPageStore} from './match-history-page-store';
import {CommonDialogService} from '../../../../shared/services/common-dialog.service';

@Component({
  selector: 'app-match-history-page',
  providers: [MatchHistoryPageStore],
  imports: [
    MatchHistoryToolbar,
    MatchHistoryCards
  ],
  templateUrl: './match-history-page.html',
  styleUrl: './match-history-page.scss'
})
export class MatchHistoryPage {
  private readonly commonDialogService = inject(CommonDialogService);
  private readonly store = inject(MatchHistoryPageStore);

  protected readonly uiState = this.store.state;

  protected readonly toolbarLoading = computed<boolean>(() => {
    return this.uiState().matches.status === 'loading';
  });

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
}
