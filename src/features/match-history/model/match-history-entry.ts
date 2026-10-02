import {X01Match} from '../../../data/model/x01/match/x01-match';

export interface MatchHistoryEntry {
  match: X01Match;
  lastVisitedAt: number;
}
