import {MatchStatus} from '../../../../data/model/base-match/match-status';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {ResultType} from '../../../../data/model/base-match/result-type';
import {X01MatchFormat} from '../../../../data/model/x01/match/x01-match-format';

export interface MatchHistoryCardData {
  matchId: string;
  x01: number;
  bestOfSets: number;
  bestOfLegs: number;
  bestOfType: X01BestOfType;
  format: X01MatchFormat;
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
