import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseFormComponent} from '../base-form/base-form.component';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {X01Match} from '../../models/x01-match/x01-match';
import {MatchStatus} from '../../models/match/match-status';
import {MatchType} from '../../models/match/match-type';
import {MatchPlayer} from '../../models/match/match-player';
import {MatDialog} from '@angular/material/dialog';
import {DartBotInfoDialogComponent} from '../dart-bot-info-dialog/dart-bot-info-dialog.component';
import {ConfigureMatchPlayerDialogComponent} from '../configure-match-player-dialog/configure-match-player-dialog.component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CustomValidators} from '../../validators/custom-validators';
import {ApiErrorBody} from '../../../api/error/api-error-body';
import {ApiErrorEnum} from '../../../api/error/api-error.enum';

@Component({
  selector: 'app-match-form',
  templateUrl: './match-form.component.html',
  styleUrls: ['./match-form.component.scss']
})
export class MatchFormComponent extends BaseFormComponent<X01Match> implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject();

  matchForm = this.fb.group({
    matchType: [501, Validators.required],
    bestOf: this.fb.group({
      type: ['SETS', Validators.required],
      legs: ['1', [Validators.min(1), Validators.required]],
      sets: ['1', [Validators.min(1), Validators.required]],
    }),
    trackCheckouts: [false, Validators.required],
    players: this.fb.array([], CustomValidators.minLengthArray(1))
  });

  get form(): FormGroup {
    return this.matchForm;
  }

  get players() {
    return this.form.get('players') as FormArray;
  }

  constructor(fb: FormBuilder, private matDialog: MatDialog, private changeDetectorRef: ChangeDetectorRef) {
    super(fb);
  }

  ngOnInit() {

  }

  setFormData(x01Match: X01Match) {
    this.form.patchValue({
      matchType: x01Match.x01,
      bestOf: {
        type: x01Match.bestOf.sets > 1 ? 'SETS' : 'LEGS',
        legs: x01Match.bestOf.legs,
        sets: x01Match.bestOf.sets
      },
      trackCheckouts: x01Match.trackDoubles
    });

    this.players.clear();
    x01Match.players.map(value => this.fb.control(value)).forEach(value => this.players.push(value));

    this.changeDetectorRef.detectChanges();
  }

  addPlayer() {
    this.matDialog.open(ConfigureMatchPlayerDialogComponent)
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(matchPlayer => {
        if (matchPlayer) {
          this.players.push(this.fb.control(matchPlayer));
          console.log(this.players);
        }
      });
  }

  editPlayer(player: MatchPlayer, index: number) {
    this.matDialog.open(ConfigureMatchPlayerDialogComponent, {data: player})
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(matchPlayer => {
        if (matchPlayer) {
          console.log(matchPlayer);
          this.players.at(index).patchValue(matchPlayer);
        }
      });
  }

  createFormResult(): X01Match {
    const form = this.form;

    const x01Players: MatchPlayer[] = (form.get('players') as FormArray).value;

    return {
      id: undefined,
      startDate: new Date(),
      endDate: undefined,
      throwFirst: x01Players[0]?.playerId,
      currentThrower: undefined,
      matchType: MatchType.X01,
      x01: form.get('matchType').value,
      trackDoubles: form.get('trackCheckouts').value,
      matchStatus: MatchStatus.LOBBY,
      bestOf: {
        sets: form.get('bestOf.type').value === 'SETS' ? form.get('bestOf.sets').value : 1,
        legs: form.get('bestOf.legs').value,
      },
      result: undefined,
      statistics: undefined,
      players: x01Players,
      timeline: undefined
    };
  }

  handleApiError(apiError: ApiErrorBody) {
    super.handleApiError(apiError);

    switch (apiError?.error) {
      case ApiErrorEnum.INVALID_ARGUMENTS: {
        this.setError('matchType', apiError.details.x01);
        this.setError('bestOf.type', apiError.details.type);
        this.setError('bestOf.sets', apiError.details.sets);
        this.setError('bestOf.legs', apiError.details.legs);
        this.setError('players', apiError.details.players);

        // Set the specific player errors.
        const playerErrors: { [index: number]: [error: string] } = {};
        Object.keys(apiError.details).filter(value => value.startsWith('players[')).forEach(key => {
          const index = key.split('players[').pop().split(']')[0];
          playerErrors[index] = apiError.details[key];
        });

        Object.keys(playerErrors).forEach(key => {
          this.setError(`players.${key}`, playerErrors[key]);
        });

        break;
      }
    }
  }

  removePlayer(index: number) {
    this.players.removeAt(index);
  }

  openDartBotInfoDialog() {
    this.matDialog.open(DartBotInfoDialogComponent);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
