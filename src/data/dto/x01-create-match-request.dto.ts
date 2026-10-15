import {PlayerType} from '../model/base-match/player-type';
import {X01BestOfType} from '../model/x01/rules/x01-best-of-type';
import {X01ClearByTwoRule} from '../model/x01/rules/x01-clear-by-two-rule';
import {X01MatchFormat} from '../model/x01/match/x01-match-format';

export interface X01CreateMatchRequestDto {
  matchSettings: {
    x01: number;
    trackDoubles: boolean;
    bestOf: {
      sets: number;
      legs: number;
      bestOfType: X01BestOfType;
      clearByTwoSetsRule: X01ClearByTwoRule;
      clearByTwoLegsRule: X01ClearByTwoRule;
      clearByTwoLegsInFinalSetRule: X01ClearByTwoRule;
    };
    format: X01MatchFormat;
  };
  players: {
    playerName: string;
    playerType: PlayerType;
    x01DartBotSettings?: {
      threeDartAverage: number;
    };
  }[];
}
