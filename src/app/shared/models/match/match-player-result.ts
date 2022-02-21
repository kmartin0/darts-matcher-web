import {ResultType} from './result-type';

export interface MatchPlayerResult {
  playerId: string;
  score: number;
  result: ResultType;
}
