import {ResultType} from '../../../../shared/models/match/result-type';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {getMatchPlayerDisplayName} from '../../../../shared/models/match/match-player';
import {humanizeDuration} from '../../../../shared/helpers/utility';

export class X01MatchInformationUiData {

  result: { playerName: string, result: ResultType, score: number }[];
  rules: { goal: string, sets: number, legs: number, x01: number };
  date: { startDate: Date, endDate: Date, duration: string };
  trivia: { setsPlayed: number, legsPlayed: number, matchId: string };

  constructor(x01Match: X01Match) {
    this.initResult(x01Match);
    this.initRules(x01Match);
    this.initDate(x01Match);
    this.initTrivia(x01Match);
  }


  private initResult(x01Match: X01Match) {
    this.result = x01Match.players.map(matchPlayer => {
      const uiPlayerResult = {
        playerName: getMatchPlayerDisplayName(matchPlayer),
        result: null,
        score: 0,
      };

      // Get the players' result.
      const playerResult = x01Match.x01Result.find(_playerResult => _playerResult.playerId === matchPlayer.playerId);

      // Set the result.
      uiPlayerResult.result = playerResult.result;

      // Set the score. Depending on if the match uses legs or sets as a goal.
      uiPlayerResult.score = x01Match.x01MatchSettings.bestOf.sets > 1 ? playerResult.setsWon : playerResult.legsWon;

      return uiPlayerResult;
    });
  }

  private initRules(x01Match: X01Match) {
    this.rules = {
      goal: 'Best Of',
      sets: x01Match.x01MatchSettings.bestOf.sets,
      legs: x01Match.x01MatchSettings.bestOf.legs,
      x01: x01Match.x01MatchSettings.x01
    };
  }

  private initDate(x01Match: X01Match) {
    let durationHumanReadable = '';

    if (x01Match.endDate) {
      const diffMs = (new Date(x01Match.endDate).getTime() - new Date(x01Match.startDate).getTime());
      durationHumanReadable = humanizeDuration(diffMs);
    }

    this.date = {
      startDate: x01Match.startDate,
      endDate: x01Match.endDate,
      duration: durationHumanReadable
    };
  }

  private initTrivia(x01Match: X01Match) {
    this.trivia = {
      matchId: x01Match.id,
      setsPlayed: x01Match.timeline.length,
      legsPlayed: x01Match.timeline.map(x01Set => x01Set.legs.length).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
    };
  }

}
