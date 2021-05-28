import {Component, HostListener, Inject, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatRadioGroup} from '@angular/material/radio';

export interface NumOfDartsDialogData {
  title: string;
  options: number[];
}

@Component({
  selector: 'app-final-throw-dialog-component',
  templateUrl: './num-of-darts-dialog.component.html',
  styleUrls: ['./num-of-darts-dialog.component.scss']
})
export class NumOfDartsDialogComponent {

  dartsOptionsFormControl = new FormControl();
  dartsOptions: number[]; // Default options if no options are given.
  title: string;
  @ViewChild(MatRadioGroup) radioGroup!: MatRadioGroup;

  constructor(public dialogRef: MatDialogRef<NumOfDartsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: NumOfDartsDialogData) {

    // Remove darts used options if they are not possible.
    this.dartsOptions = data.options;
    this.dartsOptionsFormControl.setValue(this.dartsOptions[0]);

    // Set the title
    this.title = data.title;
  }

  onSubmit() {
    this.dialogRef.close(this.dartsOptionsFormControl.value);
  }

  // TODO
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
    if (this.dartsOptions.includes(dartsUsed)) {
      const radioButton = this.radioGroup._radios.find(item => item.value === dartsUsed);

      // Change the selected radio button by changing form control value and move focus to the new radio button.
      this.dartsOptionsFormControl.setValue(dartsUsed);
      radioButton._inputElement.nativeElement.focus();
    }
  }
}

