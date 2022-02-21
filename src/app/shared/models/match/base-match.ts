import {MatchStatus} from './match-status';
import {MatchPlayer} from './match-player';
import {MatchPlayerResult} from './match-player-result';
import {MatchType} from './match-type';

export interface BaseMatch {
  id: string;
  startDate: Date;
  endDate: Date;
  currentThrower: string;
  matchStatus: MatchStatus;
  players: MatchPlayer[];
  matchResult: MatchPlayerResult[];
  matchType: MatchType;
}
