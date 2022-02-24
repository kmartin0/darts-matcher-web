import {Component, HostListener, Inject, OnDestroy} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {X01Match} from '../../models/x01-match/x01-match';
import {Subject} from 'rxjs';

export interface ThrowDialogData {
  selectedSetNumber: number;
  selectedLegNumber: number;
  match: X01Match;
  round: number;
  playerId: string;
  playerName: string;
  score?: number;
}

export enum EditThrowDialogActions {
  EDIT, DELETE
}

@Component({
  selector: 'app-edit-throw-dialog',
  templateUrl: './edit-throw-dialog.component.html',
  styleUrls: ['./edit-throw-dialog.component.scss']
})
export class EditThrowDialogComponent implements OnDestroy {

  newScoreInput = new FormControl(null, {validators: Validators.required});

  unsubscribe$ = new Subject();

  constructor(public dialogRef: MatDialogRef<EditThrowDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ThrowDialogData) {
    if (this.isDataValid()) {
      this.newScoreInput.setValue(data.score);
    }
  }

  isDataValid(): boolean {
    return !!this.data &&
      !!this.data.match &&
      !!this.data.selectedSetNumber &&
      !!this.data.selectedSetNumber &&
      !!this.data.round &&
      !!this.data.playerId;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onDelete() {
    if (this.isDataValid()) {
      this.dialogRef.close({action: EditThrowDialogActions.DELETE});
    }
  }

  @HostListener('keydown.enter')
  onSubmit() {
    if (this.isDataValid()) {
      const newScore = this.newScoreInput.value as number;
      if (newScore === null || newScore === undefined || !Number.isInteger(newScore) || newScore < 0 || newScore > 180) {
        this.newScoreInput.setErrors({invalid: 'Enter a valid score between 0 and 180.'});
      } else {
        this.data.score = this.newScoreInput.value;
        this.dialogRef.close({action: EditThrowDialogActions.EDIT, data: this.data});
      }
    } else {
      this.dialogRef.close();
    }
  }

}
