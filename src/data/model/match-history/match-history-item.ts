import {X01Match} from '../x01/match/x01-match';

export interface MatchHistoryItem {
  match: X01Match;
  lastVisitedAt: number; // Unix timestamp in seconds
}
