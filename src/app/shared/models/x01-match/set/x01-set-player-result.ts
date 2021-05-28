import {ResultType} from '../../match/result-type';

export interface X01SetPlayerResult {
  playerId: string;
  legsWon: number;
  result: ResultType;
}
