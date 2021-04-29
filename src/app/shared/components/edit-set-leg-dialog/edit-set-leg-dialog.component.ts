import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {X01Match} from '../../models/x01-match/x01-match';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ThrowDialogData} from '../edit-throw-dialog/edit-throw-dialog.component';

export interface EditSetLegDialogData {
  match: X01Match;
  selectedLegNumber: number;
  selectedSetNumber: number;
}

export enum EditSetLegDialogActions {
  DELETE_SET, DELETE_LEG
}

@Component({
  selector: 'app-edit-set-leg-dialog',
  templateUrl: './edit-set-leg-dialog.component.html',
  styleUrls: ['./edit-set-leg-dialog.component.scss']
})
export class EditSetLegDialogComponent implements OnInit {

  action: EditSetLegDialogActions = null;
  actions = EditSetLegDialogActions;

  constructor(public dialogRef: MatDialogRef<EditSetLegDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ThrowDialogData, private changeDetectorRef: ChangeDetectorRef) {
  }

  isDataValid(): boolean {
    return !!this.data &&
      !!this.data.match &&
      !!this.data.selectedSetNumber &&
      !!this.data.selectedSetNumber;
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
        case EditSetLegDialogActions.DELETE_SET:
          this.dialogRef.close({action: this.action});
          break;
        case EditSetLegDialogActions.DELETE_LEG:
          this.dialogRef.close({action: this.action});
          break;
      }
    }
  }

  onDeleteLegClick() {
    this.action = EditSetLegDialogActions.DELETE_LEG;
    this.changeDetectorRef.detectChanges();
  }

  onDeleteSetClick() {
    this.action = EditSetLegDialogActions.DELETE_SET;
    this.changeDetectorRef.detectChanges();
  }

}
