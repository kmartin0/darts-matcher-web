import {Component, ElementRef, OnInit, Output, ViewChild, EventEmitter, OnDestroy, HostListener} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent implements OnInit, OnDestroy {

  keyboardButtons = [
    {type: 'number', value: 1},
    {type: 'number', value: 2},
    {type: 'number', value: 3},
    {type: 'number', value: 4},
    {type: 'number', value: 5},
    {type: 'number', value: 6},
    {type: 'number', value: 7},
    {type: 'number', value: 8},
    {type: 'number', value: 9},
    {type: 'button', value: 'Del'},
    {type: 'number', value: 0},
    {type: 'button', value: 'Ent'},
  ];

  @Output() scoreOutput = new EventEmitter<number>();
  @ViewChild('scoreInput') scoreInput: ElementRef;
  score: number;
  @ViewChild('formDirective') scoreFormElement: NgForm;
  private unsubscribe$ = new Subject();

  constructor(private dialog: MatDialog) {
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPressed(event: KeyboardEvent) {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.onKeyClick(this.keyboardButtons.find(button => button.value === 'Del'));
      } else if (event.key === 'Enter') {
        this.onKeyClick(this.keyboardButtons.find(button => button.value === 'Ent'));
      } else {
        const key = this.keyboardButtons.find(_key => _key.value.toString() === event.key.toString());
        if (key) this.onKeyClick(key);
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  ngOnInit(): void {
  }

  onKeyClick(key: { type: string, value: number | string }) {
    if (key.type === 'number') {
      this.updateScore(this.score ? `${this.score}` + `${key.value}` : `${key.value}`);
    }
    if (key.type === 'button') {
      if (key.value === 'Del') {
        this.updateScore(this.score ? this.score.toString().slice(0, -1) : null);
      }
      if (key.value === 'Ent') {
        this.onSubmit();
      }
    }
  }

  onSubmit() {
    this.scoreOutput.emit(this.score);
    this.score = null;
  }

  private updateScore(newScore: number | string) {
    const newScoreNumber = Number(newScore);
    if (newScore >= 0 && newScore <= 180) {
      this.score = newScoreNumber;
    }
  }

}
