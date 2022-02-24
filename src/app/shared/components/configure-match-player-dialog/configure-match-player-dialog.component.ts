import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseFormComponent} from '../base-form/base-form.component';
import {MatchPlayer} from '../../models/match/match-player';
import {MatchPlayerInviteStatus} from '../../models/match/match-player-invite-status';
import {PlayerType} from '../../models/match/player-type';
import {distinctUntilChanged} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DartBotInfoDialogComponent} from '../dart-bot-info-dialog/dart-bot-info-dialog.component';
import {MatStepper} from '@angular/material/stepper';

@Component({
  selector: 'app-configure-match-player-dialog',
  templateUrl: './configure-match-player-dialog.component.html',
  styleUrls: ['./configure-match-player-dialog.component.scss']
})
export class ConfigureMatchPlayerDialogComponent extends BaseFormComponent<any> implements OnInit, AfterViewInit {

  playerTypeEnum = PlayerType;

  playerForm: FormGroup = this.fb.group({
    playerType: this.fb.control({}),
    matchPlayer: this.fb.group({})
  });

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(private dialogRef: MatDialogRef<ConfigureMatchPlayerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: MatchPlayer, fb: FormBuilder, private matDialog: MatDialog, private cdr: ChangeDetectorRef) {
    super(fb);

    this.validForm.subscribe(value => {
      this.onValidForm();
    });
  }

  ngOnInit(): void {
    this.form.get('playerType').valueChanges.pipe(distinctUntilChanged()).subscribe(playerType => {
      const matchPlayerGroup = this.form.get('matchPlayer') as FormGroup;

      Object.keys(matchPlayerGroup.controls).forEach(formKey => {
        matchPlayerGroup.removeControl(formKey);
      });

      switch (playerType) {
        case this.playerTypeEnum.ANONYMOUS: {
          matchPlayerGroup.addControl('name', this.fb.control('', [Validators.required]));
          break;
        }
        case this.playerTypeEnum.DART_BOT: {
          matchPlayerGroup.addControl('name', this.fb.control('', [Validators.required]));
          matchPlayerGroup.addControl('avg', this.fb.control(40, [Validators.min(1), Validators.max(180), Validators.required]));
          break;
        }
        case this.playerTypeEnum.REGISTERED: {
        }
      }
    });

    this.setupInitialFormState();
  }

  private setupInitialFormState() {
    if (!this.data) {
      this.form.get('playerType').setValue(this.playerTypeEnum.ANONYMOUS);
      return;
    }

    this.form.get('playerType').setValue(this.data.playerType);

    const matchPlayerGroup = this.form.get('matchPlayer') as FormGroup;

    switch (this.data.playerType) {
      case this.playerTypeEnum.ANONYMOUS: {
        matchPlayerGroup.get('name').setValue(this.data.playerId);
        break;
      }
      case this.playerTypeEnum.DART_BOT: {
        matchPlayerGroup.get('name').setValue(this.data.playerId);
        matchPlayerGroup.get('avg').setValue(this.data.dartBotSettings.expectedThreeDartAverage);
        break;
      }
      case this.playerTypeEnum.REGISTERED: {
      }
    }
  }

  ngAfterViewInit() {
    if (this.data) {
      this.stepper.selectedIndex = 1;
      this.cdr.detectChanges();
    }
  }

  addPlayer() {
    this.onSubmitForm();
  }

  onValidForm() {
    const playerType = this.form.get('playerType').value;

    const matchPlayerControl = this.form.get('matchPlayer');
    let matchPlayer: MatchPlayer;

    switch (playerType) {
      case this.playerTypeEnum.ANONYMOUS: {
        matchPlayer = {
          inviteStatus: MatchPlayerInviteStatus.ACCEPTED,
          playerId: matchPlayerControl.get('name').value,
          playerType: PlayerType.ANONYMOUS
        };
        break;
      }
      case this.playerTypeEnum.DART_BOT: {
        matchPlayer = {
          inviteStatus: MatchPlayerInviteStatus.ACCEPTED,
          playerId: matchPlayerControl.get('name').value,
          playerType: PlayerType.DART_BOT,
          dartBotSettings: {expectedThreeDartAverage: matchPlayerControl.get('avg').value}
        };
        break;
      }
      case this.playerTypeEnum.REGISTERED: {

      }
    }

    this.dialogRef.close(matchPlayer);
  }

  openDartBotInfoDialog() {
    this.matDialog.open(DartBotInfoDialogComponent);
  }

  get form(): FormGroup {
    return this.playerForm;
  }

}
