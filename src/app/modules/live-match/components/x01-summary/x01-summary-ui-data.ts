import {ResultType} from '../../../../shared/models/match/result-type';
import {BehaviorSubject} from 'rxjs';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {MatchPlayer} from '../../../../shared/models/match/match-player';
import {X01Set} from '../../../../shared/models/x01-match/set/x01-set';
import {X01Leg} from '../../../../shared/models/x01-match/leg/x01-leg';
import {X01LegRound} from '../../../../shared/models/x01-match/leg/x01-leg-round';

export interface SummaryTableDataSource {
  columns: string[];
  legs: SummaryLeg[];
}

export interface SummaryLeg {
  leg?: string;
  darts?: number;
  players?: { [playerId: string]: SummaryPlayerLeg };
}

export interface SummaryPlayerLeg {
  avg?: number;
  remaining?: number;
  darts?: number;
  legResult?: ResultType;
  setResult?: ResultType;
}

export class X01SummaryUiData {

  dataSource: BehaviorSubject<SummaryTableDataSource> = new BehaviorSubject(null);

  constructor(x01Match: X01Match) {
    this.initDataSource(x01Match);
  }

  private initDataSource(x01Match: X01Match) {

    const newSource: SummaryTableDataSource = {
      columns: [],
      legs: []
    };

    // Create the column keys.
    newSource.columns.push(...this.createColumnKeys(x01Match.players));

    // Add the leg summaries.
    newSource.legs.push(...this.createMatchSummary(x01Match.timeline, x01Match.x01));

    this.dataSource.next(newSource);
    console.log(newSource);
  }

  private createColumnKeys(matchPlayers: MatchPlayer[]): string[] {
    const columnKeys = matchPlayers.map(matchPlayer => matchPlayer.playerId);
    columnKeys.splice(0, 0, 'first-column');

    return columnKeys;
  }

  private createMatchSummary(timeline: X01Set[], x01: number): SummaryLeg[] {
    const matchSummary: SummaryLeg[] = [];

    timeline.forEach(x01Set => {
      matchSummary.push(...this.createSetSummary(x01Set, x01));
    });

    return matchSummary;
  }

  private createSetSummary(x01Set: X01Set, x01: number): SummaryLeg[] {
    const legSummaries: SummaryLeg[] = [];
    const lastLeg = x01Set.legs.reduce((previousValue, currentValue) => currentValue.leg > previousValue.leg ? currentValue : previousValue).leg;

    x01Set.legs.forEach(x01Leg => {
      legSummaries.push(this.createLegSummary(x01Leg, x01Set, x01, lastLeg === x01Leg.leg));
    });

    return legSummaries;
  }

  private createLegSummary(x01Leg: X01Leg, x01Set: X01Set, x01: number, isLastLeg: boolean): SummaryLeg {
    const legSummary: SummaryLeg = {leg: `${x01Set.set}.${x01Leg.leg}`, darts: 0, players: {}};

    legSummary.players = this.createPlayerLegSummaries(x01Leg.rounds, x01Leg.winner, x01);

    Object.keys(legSummary.players).forEach(key => {
      const playerLegSummary = legSummary.players[key];
      playerLegSummary.avg = Math.round(((x01 - playerLegSummary.remaining) / playerLegSummary.darts) * 3);

      if (isLastLeg) {
        playerLegSummary.setResult = x01Set.result.find(playerResult => playerResult.playerId === key).result;
      } else {
        playerLegSummary.setResult = null;
      }

      if (key === x01Leg.winner) legSummary.darts = playerLegSummary.darts;

      legSummary.players[key] = playerLegSummary; // TODO: Check if this is necessary.
    });

    return legSummary;
  }

  private createPlayerLegSummaries(x01LegRounds: X01LegRound[], legWinner: string, x01: number): { [playerId: string]: SummaryPlayerLeg } {
    const playerLegSummaries: { [playerId: string]: SummaryPlayerLeg } = {};

    x01LegRounds.forEach(legRound => {
      legRound.playerScores.forEach(playerScore => {
        const hasPlayerWonLeg = legWinner === playerScore.playerId;

        const playerLegSummary = playerLegSummaries[playerScore.playerId] ?? {
          remaining: x01,
          legResult: hasPlayerWonLeg ? ResultType.WIN : ResultType.LOSE,
          darts: 0
        };

        playerLegSummary.remaining = playerLegSummary.remaining - playerScore.score;

        playerLegSummary.darts += playerScore.dartsUsed;

        playerLegSummaries[playerScore.playerId] = playerLegSummary;
      });
    });

    return playerLegSummaries;
  }

}
