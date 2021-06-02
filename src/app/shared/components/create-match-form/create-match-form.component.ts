import {Component} from '@angular/core';
import {BaseFormComponent} from '../base-form/base-form.component';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {X01Match} from '../../models/x01-match/x01-match';
import {MatchStatus} from '../../models/match/match-status';
import {MatchType} from '../../models/match/match-type';
import {MatchPlayer} from '../../models/match/match-player';
import {PlayerType} from '../../models/match/player-type';
import {X01DartBotSettings} from '../../models/x01-match/x01-dart-bot/x01-dart-bot-settings';

@Component({
  selector: 'app-create-match-form',
  templateUrl: './create-match-form.component.html',
  styleUrls: ['./create-match-form.component.scss']
})
export class CreateMatchFormComponent extends BaseFormComponent<X01Match> {

  matchForm = this.fb.group({
    matchType: ['MATCH_501', Validators.required],
    bestOf: this.fb.group({
      type: ['SETS', Validators.required],
      legs: ['1', [Validators.min(1), Validators.required]],
      sets: ['1', [Validators.min(1), Validators.required]],
    }),
    trackCheckouts: [true, Validators.required],
    players: this.fb.array([
      this.fb.group({
        playerId: ['', Validators.required],
        bot: [false, Validators.required],
        botAvg: [40, [Validators.min(1), Validators.max(180), Validators.required]]
      })
    ])
  });

  get form(): FormGroup {
    return this.matchForm;
  }

  get players() {
    return this.form.get('players') as FormArray;
  }

  constructor(fb: FormBuilder) {
    super(fb);
  }

  addPlayer() {
    this.players.push(this.fb.group({
      playerId: ['', Validators.required],
      bot: [false, Validators.required],
      botAvg: [40, [Validators.min(1), Validators.max(180), Validators.required]]
    }));
  }

  createFormResult(): X01Match {
    const form = this.form;

    const x01Players: MatchPlayer[] = [];

    const formArrayPlayers = form.get('players') as FormArray;
    let dartBotSetting: X01DartBotSettings;

    (formArrayPlayers.value).forEach(player => {

      if (player.bot) dartBotSetting = {expectedThreeDartAverage: player.botAvg};

      x01Players.push({
        playerId: player.playerId,
        playerType: player.bot ? PlayerType.DART_BOT : PlayerType.ANONYMOUS,
        dartBotSettings: player.bot ? {expectedThreeDartAverage: player.botAvg} : null
      });
    });

    return {
      id: undefined,
      startDate: new Date(),
      endDate: undefined,
      throwFirst: x01Players[0].playerId,
      currentThrower: undefined,
      matchType: MatchType.X01,
      x01: 501,
      trackDoubles: form.get('trackCheckouts').value,
      matchStatus: MatchStatus.IN_PLAY,
      bestOf: {
        sets: form.get('bestOf.sets').value,
        legs: form.get('bestOf.legs').value,
      },
      result: undefined,
      statistics: undefined,
      players: x01Players,
      timeline: undefined
    };
  }

  removePlayer(index: number) {
    this.players.removeAt(index);
  }

}
