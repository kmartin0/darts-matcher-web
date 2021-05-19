import {Component, HostListener, Inject, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatRadioGroup} from '@angular/material/radio';

export interface FinalThrowDialogData {
  minDarts: number;
}

@Component({
  selector: 'app-final-throw-dialog-component',
  templateUrl: './final-throw-dialog.component.html',
  styleUrls: ['./final-throw-dialog.component.scss']
})
export class FinalThrowDialogComponent {

  dartsUsedFormControl = new FormControl();
  dartsUsedOptions = [1, 2, 3];
  @ViewChild(MatRadioGroup) radioGroup!: MatRadioGroup;

  constructor(public dialogRef: MatDialogRef<FinalThrowDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: FinalThrowDialogData) {

    // Remove darts used options if they are not possible.
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

  onSubmit() {
    this.dialogRef.close(this.dartsUsedFormControl.value);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case '1':
      case '2':
      case '3':
        this.updateDartsUsed(Number(event.key));
        break;
      case 'Enter':
        this.onSubmit();
        break;
    }
  }

  private updateDartsUsed(dartsUsed: number) {
    if (this.dartsUsedOptions.includes(dartsUsed)) {
      const radioButton = this.radioGroup._radios.find(item => item.value === dartsUsed);

      // Change the selected radio button by changing form control value and move focus to the new radio button.
      this.dartsUsedFormControl.setValue(dartsUsed);
      radioButton._inputElement.nativeElement.focus();
    }
  }
}

