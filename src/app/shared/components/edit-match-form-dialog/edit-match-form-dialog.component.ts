import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {X01Match} from '../../models/x01-match/x01-match';
import {MatchFormComponent} from '../match-form/match-form.component';
import {MatchService} from '../../services/match.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {isApiErrorBody} from '../../../api/error/api-error-body';

@Component({
  selector: 'app-edit-match-form-dialog',
  templateUrl: './edit-match-form-dialog.component.html',
  styleUrls: ['./edit-match-form-dialog.component.scss']
})
export class EditMatchFormDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatchFormComponent, {static: false}) matchFormComponent!: MatchFormComponent;
  private unsubscribe$ = new Subject();

  constructor(public dialogRef: MatDialogRef<EditMatchFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: X01Match, private matchService: MatchService) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    if (this.data) {
      console.log(this.matchFormComponent);
      this.matchFormComponent.setFormData(this.data);
    }
  }

  updateMatch(x01Match: X01Match) {
    if (this.data) {
      x01Match.id = this.data.id;
      this.matchService.updateMatch(x01Match)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(value => {
          this.dialogRef.close();
        }, error => {
          console.log(error);
          if (isApiErrorBody(error)) {
            this.matchFormComponent.handleApiError(error);
          }
        });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
