import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {X01Match} from '../../models/x01-match/x01-match';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RoundDataSourcePlayerScore} from '../../../modules/match/components/x01-match-sheet/x01-match-sheet-ui-data';

export interface X01EditActionsDialogData {
  match: X01Match;
  selectedLegNumber: number;
  selectedSetNumber: number;
  lastPlayerScores: { round: number, playerId: string, playerName: string, playerScore: RoundDataSourcePlayerScore }[];
}

export enum X01EditActionsDialogActions {
  DELETE_SET, DELETE_LEG, EDIT_LAST_SCORE
}

@Component({
  selector: 'app-x01-edit-actions-dialog',
  templateUrl: './x01-edit-actions-dialog.component.html',
  styleUrls: ['./x01-edit-actions-dialog.component.scss']
})
export class X01EditActionsDialogComponent implements OnInit {

  action: X01EditActionsDialogActions = null;
  actions = X01EditActionsDialogActions;

  constructor(public dialogRef: MatDialogRef<X01EditActionsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: X01EditActionsDialogData, private changeDetectorRef: ChangeDetectorRef) {
  }

  isDataValid(): boolean {
    return !!this.data &&
      !!this.data.match &&
      !!this.data.selectedSetNumber &&
      !!this.data.selectedSetNumber &&
      !!this.data.lastPlayerScores;
  }

  ngOnInit(): void {
  }

  onCancel() {
    if (this.action != null) this.action = null;
    else this.dialogRef.close();
  }


  onDelete() {
    if (this.isDataValid() && this.action != null) {
      switch (this.action) {
        case X01EditActionsDialogActions.DELETE_SET:
          this.dialogRef.close({action: this.action});
          break;
        case X01EditActionsDialogActions.DELETE_LEG:
          this.dialogRef.close({action: this.action});
          break;
      }
    }
  }

  onDeleteLegClick() {
    this.action = X01EditActionsDialogActions.DELETE_LEG;
    this.changeDetectorRef.detectChanges();
  }

  onDeleteSetClick() {
    this.action = X01EditActionsDialogActions.DELETE_SET;
    this.changeDetectorRef.detectChanges();
  }

  onEditScoreClick(_lastPlayerScore: { round: number, playerId: string, playerName: string, playerScore: RoundDataSourcePlayerScore }) {
    this.action = X01EditActionsDialogActions.EDIT_LAST_SCORE;

    if (this.isDataValid() && this.action != null) {
      this.dialogRef.close({action: this.action, lastPlayerScore: _lastPlayerScore});
    }
  }

}
