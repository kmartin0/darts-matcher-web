import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface FinalThrowDialogData {
  minDarts: number;
}

@Component({
  selector: 'app-final-throw-dialog-component',
  templateUrl: './final-throw-dialog.component.html',
  styleUrls: ['./final-throw-dialog.component.scss']
})
export class FinalThrowDialogComponent implements OnInit {

  dartsUsedFormControl = new FormControl();
  dartsUsedOptions = [1, 2, 3];

  constructor(public dialogRef: MatDialogRef<FinalThrowDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: FinalThrowDialogData) {
    console.log(data);
    if (data && data.minDarts) {
      switch (data.minDarts) {
        case 2: {
          this.dartsUsedOptions = [2, 3];
          break;
        }
        case 3: {
          this.dartsUsedOptions = [3];
          break;
        }
      }
    }
    this.dartsUsedFormControl.setValue(this.dartsUsedOptions[0]);
  }

  ngOnInit(): void {
  }

  @HostListener('keydown.enter')
  onSubmit() {
    this.dialogRef.close(this.dartsUsedFormControl.value);
  }
}

