import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface BasicDialogData {
  title: string;
  subtitle?: string;
  content: string;
  ok?: string;
  cancel?: string;
  svgIcon?: string;
  matIcon?: string;
}

@Component({
  selector: 'app-basic-dialog',
  templateUrl: './basic-dialog.component.html',
  styleUrls: ['./basic-dialog.component.scss']
})
export class BasicDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: BasicDialogData) {
  }

  ngOnInit(): void {
  }

}
