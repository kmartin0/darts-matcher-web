import {MatchStatus} from '../../../../data/model/base-match/match-status';
import {ResultType} from '../../../../data/model/base-match/result-type';
import {X01MatchSettings} from '../../../../data/model/x01/match/x01-match-settings';

export interface MatchHistoryCardData {
  matchId: string;
  matchSettings: X01MatchSettings;
  startDate: number; // Unix timestamp in seconds
  lastVisitedAt: number; // Unix timestamp in seconds
  matchStatus: MatchStatus;
  players: MatchHistoryCardPlayerData[];
}

export interface MatchHistoryCardPlayerData {
  playerId: string;
  name: string;
  setsWon: number;
  legsWon: number;
  average: number | null;
  checkoutPercentage: number | null;
  resultType: ResultType | null;
}
