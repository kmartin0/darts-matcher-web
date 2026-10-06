import {MatchHistoryEntry} from '../../../../data/model/match-history/match-history-entry';
import {ToolbarError} from '../../../../shared/types/toolbar-error';

export type MatchHistoryToolbarErrorSource =
  | 'matches'
  | 'deleteFromHistory';

export type MatchHistoryPageToolbarError = ToolbarError<MatchHistoryToolbarErrorSource>;

export interface MatchHistoryPageState {
  matches: MatchHistoryEntry[] | null;
  loading: boolean;
  toolbarError: MatchHistoryPageToolbarError | null;
  pageIndex: number;
  pageSize: number;
  totalMatches: number;
}

export const INITIAL_MATCH_HISTORY_PAGE_STATE: MatchHistoryPageState = {
  matches: null,
  loading: false,
  toolbarError: null,
  pageIndex: 0,
  pageSize: 5,
  totalMatches: 0
};
