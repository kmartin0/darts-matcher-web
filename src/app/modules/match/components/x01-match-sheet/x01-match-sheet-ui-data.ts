import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {PlayerType} from '../../../../shared/models/match/player-type';
import {ResultType} from '../../../../shared/models/match/result-type';
import {X01Set} from '../../../../shared/models/x01-match/set/x01-set';
import {X01Leg} from '../../../../shared/models/x01-match/leg/x01-leg';
import {BehaviorSubject} from 'rxjs';
import {Checkout} from '../../../../shared/models/x01-match/checkout/checkout';

export interface RoundDataSource {
  round?: number;
  darts?: number;
  playerScores?: RoundDataSourcePlayerScore;
}

export interface RoundDataSourcePlayerScore {
  [playerId: string]: { scored?: number, remaining?: number };
}

export class X01MatchSheetUiData {
  bestOf?: { legs: number, sets: number, isBestOfSets: boolean, x01: number };
  currentThrower?: string;
  dartsThrown?: number[];
  isLegInPlay: boolean;
  players?: {
    playerId?: string;
    playerName?: string;
    winOrDraw?: boolean;
    wonSets?: number;
    wonLegs?: number;
    average?: number;
    averageFirstNine?: number;
    remaining?: number;
    checkoutHint?: Checkout;
    lastThrow?: number;
  }[];
  throwsFirstInLeg?: string;

  // Used for timeline table.
  displayedColumns: string[] = [];
  roundsDataSource: BehaviorSubject<RoundDataSource[]> = new BehaviorSubject([]);
  timelineInNumbers: Map<number, number[]>;

  constructor(match: X01Match, setNumber: number, legNumber: number, checkouts: Checkout[], isLegInPlay: boolean) {
    if (!match) return;

    this.bestOf = {...match.bestOf, isBestOfSets: match.bestOf.sets > 1, x01: match.x01};
    this.isLegInPlay = isLegInPlay;
    this.players = [];

    match.players.forEach(player => {
      const stats = match.statistics.find(_stats => _stats.playerId === player.playerId);
      const playerResult = match.result.find(_playerResult => _playerResult.playerId === player.playerId);

      this.players.push({
        playerId: player.playerId,
        playerName: player.playerType === PlayerType.REGISTERED ? `${player.firstName} ${player.lastName}` : player.playerId,
        average: stats.averageStats.average,
        averageFirstNine: stats.averageStats.averageFirstNine,
        remaining: match.x01,
        winOrDraw: playerResult?.result === ResultType.WIN || playerResult?.result === ResultType.DRAW
      });
    });

    this.initWonSets(match);

    const set = (match.timeline && match.timeline.length) ? match.timeline.find(_set => _set.set === setNumber) : null;
    this.initWonLegs(set);

    const leg = (set && set.legs) ? set.legs.find(_leg => _leg.leg === legNumber) : null;
    this.initRoundsTableData(leg, match.x01, checkouts);

    this.currentThrower = match.currentThrower;
    this.timelineInNumbers = this.createTimelineInNumbers(match);
  }

  // Utility function for mat select to determine which leg has to be selected in the ui.
  compareSelectedLeg(x: { set: 0, leg: 0 }, y: { set: 0, leg: 0 }): boolean {
    return x && y ? x.set === y.set && x.leg === y.leg : x === y;
  }

  updateSelectedLeg(leg: X01Leg, x01: number, checkouts: Checkout[]) {
    this.throwsFirstInLeg = leg?.throwsFirst;

    const datasource = this.createRoundsDataSource(leg, x01);
    this.roundsDataSource.next(datasource);
    this.initRemainingAndLastThrow(datasource, x01, checkouts);
  }


  private createTimelineInNumbers(match: X01Match): Map<number, number[]> {
    if (!match.timeline || !match.timeline.length) {
      return new Map<number, number[]>([[1, [1]]]);
    }

    const timeline = new Map<number, number[]>();

    match.timeline.sort((a, b) => a.set - b.set).map(set => {
      if (!set || !set.legs) return {[set.set]: [1]};
      timeline.set(set.set, set.legs.map(leg => leg.leg).sort((n1, n2) => n1 - n2));
    });

    return timeline;

  }

  private createDisplayedColumns(): string[] {
    const columnKeys: string[] = [];

    this.players.forEach(player => {
      columnKeys.push(player.playerId);
    });

    const index = Math.ceil(this.players.length / 2);

    columnKeys.splice(index, 0, 'darts');

    return columnKeys;
  }

  private initRemainingAndLastThrow(roundsDataSource: RoundDataSource[], x01: number, checkouts: Checkout[]) {
    this.players.forEach(player => {
      if (!this.roundsDataSource) {
        player.remaining = x01;
      } else {
        const playerRounds = roundsDataSource.filter(round => round.playerScores[player.playerId]);

        const latestPlayerScore = playerRounds && playerRounds.length > 0
          ? playerRounds.reduce((previousValue, currentValue) => currentValue.round > previousValue.round ? currentValue : previousValue)?.playerScores[player.playerId]
          : null;

        // Set the latest throw for the player
        player.lastThrow = latestPlayerScore?.scored;

        // Set the remaining score for the player.
        player.remaining = latestPlayerScore?.remaining ?? x01;

        // Set the checkout hint.
        if (player.remaining <= 170) {
          player.checkoutHint = checkouts?.find(value => value.checkout === player.remaining);
        } else {
          player.checkoutHint = null;
        }
      }
    });
  }

  private createRoundsDataSource(leg: X01Leg, x01: number): RoundDataSource[] {
    const tmpRounds: RoundDataSource[] = [];
    // When the leg is empty or has no players, set the ui data to empty state.
    if (!leg || !leg.rounds) {
      this.players.forEach(player => {
        player.remaining = x01;
      });
      return tmpRounds;
    }

    leg.rounds.forEach(legRound => {
      const round: RoundDataSource = {round: legRound.round, playerScores: {}};

      legRound.playerScores.forEach(playerScore => {
        const previousRound = tmpRounds.find(_round => _round.round === legRound.round - 1);
        const previousRoundPlayerScore = previousRound && previousRound.playerScores[playerScore.playerId] ? previousRound.playerScores[playerScore.playerId] : null;
        const previousRemaining = previousRoundPlayerScore ? previousRoundPlayerScore.remaining : x01;

        const playerRemaining = previousRemaining - playerScore.score;
        round.playerScores[playerScore.playerId] = {scored: playerScore.score, remaining: playerRemaining};

      });

      // Initialize the darts used (incl.) this round.
      const dartsUsedThisRound = Math.min(...legRound.playerScores.map(value => value.dartsUsed));
      const dartsUsedExclusiveThisRound = tmpRounds.find(value => value.round === round.round - 1)?.darts ?? 0;

      if (dartsUsedThisRound === Infinity) {
        round.darts = null;
      } else if (!dartsUsedExclusiveThisRound) {
        round.darts = dartsUsedThisRound;
      } else {
        round.darts = dartsUsedThisRound + dartsUsedExclusiveThisRound;
      }

      // Push the round into the temporary rounds array.
      tmpRounds.push(round);
    });

    return tmpRounds;
  }

  private initRoundsTableData(leg: X01Leg, x01: number, checkouts: Checkout[]) {
    this.displayedColumns = this.createDisplayedColumns();
    this.updateSelectedLeg(leg, x01, checkouts);
  }

  private initWonLegs(set: X01Set) {

    if (!set || !set.legs) { // When no legs are played all players have 0 legs won.
      this.players.forEach(player => {
        player.wonLegs = 0;
      });
    } else { // The number of legs won equals the player set score.
      set.result.forEach(playerResult => {
        const player = this.players.find(_player => _player.playerId === playerResult.playerId);
        if (player) player.wonLegs = playerResult.legsWon;
      });
    }
  }

  private initWonSets(match: X01Match) {

    // When there is no timeline all players have 0 sets won.
    if (!match.timeline || !match.timeline.length) {
      this.players.forEach(player => {
        player.wonSets = 0;
      });
      return;
    }

    match.result.forEach(playerResult => {
      const player = this.players.find(_player => _player.playerId === playerResult.playerId);
      if (player) player.wonSets = playerResult.setsWon;
    });
  }

}
