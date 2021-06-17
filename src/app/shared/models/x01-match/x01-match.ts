import {MatchType} from '../match/match-type';
import {MatchStatus} from '../match/match-status';
import {X01BestOf} from './best-of/x01-best-of';
import {MatchPlayer} from '../match/match-player';
import {X01PlayerResult} from './player-result/x01-player-result';
import {X01Set} from './set/x01-set';
import {X01PlayerStatistics} from './statistics/x01-player-statistics';

export interface X01Match {
  id: string;
  startDate: Date;
  endDate: Date;
  throwFirst: string;
  currentThrower: string;
  matchType: MatchType;
  x01: number;
  trackDoubles: boolean;
  matchStatus: MatchStatus;
  bestOf: X01BestOf;
  result: X01PlayerResult[];
  statistics: X01PlayerStatistics[];
  players: MatchPlayer[];
  timeline: X01Set[];
}

export function getSet(match: X01Match, setNumber: number) {
  if (!match.timeline || !match.timeline.length) return null;

  return match.timeline.find(x01Set => x01Set.set === setNumber);
}

export function getSetInPlay(match: X01Match): X01Set {
  if (!match.timeline || !match.timeline.length) return null;

  if (match.matchStatus === MatchStatus.CONCLUDED) {
    return match.timeline.reduce((previousValue, currentValue) => currentValue.set > previousValue.set ? currentValue : previousValue);
  }

  // Find all sets without result.
  const setsWithoutResult = match.timeline.filter(set => set.result.find(playerResult => !playerResult.result));

  // Return the first set without a result.
  return setsWithoutResult.reduce((previousValue, currentValue) => (currentValue.set < previousValue.set) ? currentValue : previousValue);
}
