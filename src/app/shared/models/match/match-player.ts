import {PlayerType} from './player-type';

export interface MatchPlayer {
  playerId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  playerType: PlayerType;
}
