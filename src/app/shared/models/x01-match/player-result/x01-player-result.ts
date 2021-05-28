import {ResultType} from '../../match/result-type';

export interface X01PlayerResult {
  playerId: string;
  legsWon: number;
  setsWon: number;
  result: ResultType;
}
