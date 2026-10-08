import {MatchHistoryItem} from '../../../../data/model/match-history/match-history-item';
import {ToolbarError} from '../../../../shared/types/toolbar-error';
import {PaginationResponse} from '../../../../shared/types/pagination-response';

export type MatchHistoryToolbarErrorSource =
  | 'matches'
  | 'deleteFromHistory';

export type MatchHistoryPageToolbarError =
  ToolbarError<MatchHistoryToolbarErrorSource>;

export interface MatchHistoryPageState {
  matchHistory: PaginationResponse<MatchHistoryItem> | null;
  loading: boolean;
  toolbarError: MatchHistoryPageToolbarError | null;
  navigateToPageIndex: number | null;
}

export const INITIAL_MATCH_HISTORY_PAGE_STATE: MatchHistoryPageState = {
  matchHistory: null,
  loading: false,
  toolbarError: null,
  navigateToPageIndex: null
};
