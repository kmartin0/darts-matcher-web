import {PlayerType} from './player-type';
import {X01DartBotSettings} from '../x01-match/x01-dart-bot/x01-dart-bot-settings';

export interface MatchPlayer {
  playerId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  playerType: PlayerType;
  dartBotSettings?: X01DartBotSettings;
}

export function getMatchPlayerDisplayName(matchPlayer: MatchPlayer): string { // TODO: Use this in match sheet.
  return matchPlayer.playerType === PlayerType.REGISTERED ? `${matchPlayer.firstName} ${matchPlayer.lastName}` : matchPlayer.playerId;
}
