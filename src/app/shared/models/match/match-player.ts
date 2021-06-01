import {PlayerType} from './player-type';

export interface MatchPlayer {
  playerId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  playerType: PlayerType;
}

export function getMatchPlayerDisplayName(matchPlayer: MatchPlayer): string { // TODO: Use this in match sheet.
  return matchPlayer.playerType === PlayerType.REGISTERED ? `${matchPlayer.firstName} ${matchPlayer.lastName}` : matchPlayer.playerId;
}
