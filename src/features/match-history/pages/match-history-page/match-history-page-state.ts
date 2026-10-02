import {LoadState} from '../../../../shared/types/load-state';
import {ToolbarError} from '../../../../shared/types/toolbar-error';
import {MatchHistoryEntry} from '../../model/match-history-entry';

export type MatchHistoryToolbarErrorSource =
  | 'matches'
  | 'deleteFromHistory';

export type MatchHistoryPageToolbarError = ToolbarError<MatchHistoryToolbarErrorSource>;

export interface MatchHistoryPageState {
  matches: LoadState<MatchHistoryEntry[]>;
  toolbarError: MatchHistoryPageToolbarError | null;
}

export const INITIAL_MATCH_HISTORY_PAGE_STATE: MatchHistoryPageState = {
  matches: {status: 'idle'},
  toolbarError: null
};
