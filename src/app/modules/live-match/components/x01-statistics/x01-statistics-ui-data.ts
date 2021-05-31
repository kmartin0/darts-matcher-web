import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {PlayerType} from '../../../../shared/models/match/player-type';
import {ResultType} from '../../../../shared/models/match/result-type';
import {X01PlayerStatistics} from '../../../../shared/models/x01-match/statistics/x01-player-statistics';

export interface PlayerStatisticsData {
  playerId: string;
  playerName: string;
  statistics: X01PlayerStatistics;
  result: ResultType;
  legsWon: number;
  setsWon: number;
}

export class X01StatisticsUiData {

  statisticsDatasource: PlayerStatisticsData[];

  constructor(x01Match: X01Match) {
    this.initStatisticsDataSource(x01Match);
  }

  private initStatisticsDataSource(x01Match: X01Match) {
    const tmpSource: PlayerStatisticsData[] = [];

    x01Match.statistics.forEach(playerStats => {

      const player = x01Match.players.find(value => value.playerId === playerStats.playerId);
      const _playerId = player.playerId;
      const _result = x01Match.result.find(value => value.playerId === playerStats.playerId)?.result;
      const _playerName = player.playerType === PlayerType.REGISTERED ? `${player.firstName} ${player.lastName}` : player.playerId;

      const playerData: PlayerStatisticsData = {
        playerId: _playerId,
        playerName: _playerName,
        statistics: playerStats,
        result: _result,
        legsWon: 0,
        setsWon: 0
      };

      tmpSource.push(playerData);
    });

    // const playersResult = this.getPlayerResult(x01Match);

    tmpSource.forEach(playerStatisticsData => {
      const playerId = playerStatisticsData.playerId;
      const playerResult = x01Match.result.find(_playerResult => _playerResult.playerId === playerId);

      playerStatisticsData.setsWon = playerResult?.setsWon ?? 0;
      playerStatisticsData.legsWon = playerResult?.legsWon ?? 0;
    });

    this.statisticsDatasource = tmpSource;
  }

}
