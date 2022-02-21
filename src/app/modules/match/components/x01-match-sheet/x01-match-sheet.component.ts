import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {getSet, getSetInPlay, X01Match} from '../../../../shared/models/x01-match/x01-match';
import {UserService} from '../../../../shared/services/user.service';
import {X01MatchSheetUiData} from './x01-match-sheet-ui-data';
import {getLeg, getLegInPlay} from '../../../../shared/models/x01-match/set/x01-set';
import {getRoundInPlay} from '../../../../shared/models/x01-match/leg/x01-leg';
import {FormControl} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {
  EditThrowDialogActions,
  EditThrowDialogComponent,
  ThrowDialogData
} from '../../../../shared/components/edit-throw-dialog/edit-throw-dialog.component';
import {X01DeleteThrow} from '../../../../shared/models/x01-delete-throw';
import {
  EditSetLegDialogActions,
  EditSetLegDialogComponent,
  EditSetLegDialogData
} from '../../../../shared/components/edit-set-leg-dialog/edit-set-leg-dialog.component';
import {X01DeleteSet} from '../../../../shared/models/x01-delete-set';
import {X01DeleteLeg} from '../../../../shared/models/x01-delete-leg';
import {Checkout} from '../../../../shared/models/x01-match/checkout/checkout';
import {SectionArea} from '../../../../shared/models/x01-match/checkout/section-area';
import {SelectedRound} from './selected-round';
import {expandCollapseTrigger} from '../../../../shared/anim/expand-collapse.anim';
import {blockInitialTrigger} from '../../../../shared/anim/block-initial-render-anim';
import {ThemeService} from '../../../../shared/services/theme/theme-service';

// TODO: Future: Create Simple view with only scoreboard / Past scores. Let user toggle between simple and advanced view in toolbar.
@Component({
  selector: 'app-x01-match-sheet',
  templateUrl: './x01-match-sheet.component.html',
  styleUrls: ['./x01-match-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandCollapseTrigger, blockInitialTrigger]
})
export class X01MatchSheetComponent implements OnChanges, OnInit, OnDestroy {

  @Input() checkouts: Checkout[];
  @Input() match: X01Match;
  @Input() selectedRound: SelectedRound;

  @Output() deleteThrow = new EventEmitter<X01DeleteThrow>();
  @Output() deleteSet = new EventEmitter<X01DeleteSet>();
  @Output() deleteLeg = new EventEmitter<X01DeleteLeg>();
  @Output() editScore = new EventEmitter<{ playerId: string, round: number, score: number }>();
  @Output() selectedRoundChange = new EventEmitter<SelectedRound>();

  @ViewChild('container') container: ElementRef;
  @ViewChildren('playerInformationContainer', {read: ElementRef}) playerInformationContainers: QueryList<ElementRef>;
  @ViewChild('timelineTableContainer', {read: ElementRef}) timelineTableContainer: ElementRef;

  isDarkMode$: Observable<boolean> = this.themeService.isDarkTheme;
  matchUiData: X01MatchSheetUiData;
  modeEdit = false;
  legSelectionFormControl = new FormControl({set: 0, leg: 0});
  sectionAreas = SectionArea;
  showAverages = true;
  unsubscribe$ = new Subject();

  get middleOrder(): number {
    if (!this.match || !this.match.players) return null;
    return Math.floor((this.match.players.length - 1) / 2);
  }

  constructor(private userService: UserService, private changeDetector: ChangeDetectorRef, private dialog: MatDialog, private themeService: ThemeService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.match && changes.match.currentValue) {
      this.updateMatchUiData();
      this.scrollContentIntoView();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.legSelectionFormControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.onSelectedLegChange();
    });
  }

  onEditSetLegClick() {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {

      const selectLegValue = this.legSelectionFormControl.value;
      const setNumber = selectLegValue && selectLegValue.set ? selectLegValue.set : null;
      const legNumber = selectLegValue && selectLegValue.leg ? selectLegValue.leg : null;

      const dialogData: EditSetLegDialogData = {
        match: this.match,
        selectedLegNumber: legNumber,
        selectedSetNumber: setNumber
      };

      this.openEditSetLegDialog(dialogData);
    }
  }

  onEditScoreClick(roundToUpdate: number, playerIdToUpdate: string, oldScore: number) {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {
      const selectLegValue = this.legSelectionFormControl.value;
      const setNumber = selectLegValue && selectLegValue.set ? selectLegValue.set : null;
      const legNumber = selectLegValue && selectLegValue.leg ? selectLegValue.leg : null;

      const dialogData: ThrowDialogData = {
        match: this.match,
        selectedLegNumber: legNumber,
        selectedSetNumber: setNumber,
        playerId: playerIdToUpdate,
        round: roundToUpdate,
        score: oldScore
      };

      this.openEditThrowDialog(dialogData);
    }
  }

  toggleAverage() {
    this.showAverages = !this.showAverages;
  }

  toggleEditMode() {
    this.modeEdit = !this.modeEdit;
  }

  private openEditSetLegDialog(dialogData: EditSetLegDialogData) {
    this.dialog.open(EditSetLegDialogComponent, {data: dialogData})
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(dialogResult => {
        if (dialogResult) {
          switch (dialogResult.action as EditSetLegDialogActions) {
            case EditSetLegDialogActions.DELETE_SET: {
              this.deleteSet.emit({
                matchId: dialogData.match.id,
                set: dialogData.selectedSetNumber
              });
              break;
            }

            case EditSetLegDialogActions.DELETE_LEG: {
              this.deleteLeg.emit({
                matchId: dialogData.match.id,
                set: dialogData.selectedSetNumber,
                leg: dialogData.selectedLegNumber
              });
              break;
            }

          }
        }
      });
  }

  private openEditThrowDialog(dialogData: ThrowDialogData) {
    this.dialog.open(EditThrowDialogComponent, {data: dialogData})
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(dialogResult => {
        if (dialogResult) {
          switch (dialogResult.action) {
            case EditThrowDialogActions.EDIT: {
              this.editScore.emit(dialogResult.data);
              break;
            }
            case EditThrowDialogActions.DELETE: {
              this.deleteThrow.emit({
                leg: dialogData.selectedLegNumber,
                matchId: dialogData.match.id,
                playerId: dialogData.playerId,
                round: dialogData.round,
                set: dialogData.selectedSetNumber
              });
            }
          }
        }
      });
  }

  private onSelectedLegChange() {
    let tmpSelectedRound = this.selectedRound;

    const selectedSet = getSet(this.match, this.legSelectionFormControl.value.set);
    const selectedLeg = getLeg(selectedSet, this.legSelectionFormControl.value.leg);

    if (this.selectedRound) {
      tmpSelectedRound.set = selectedSet;
      tmpSelectedRound.leg = selectedLeg;
    } else {
      tmpSelectedRound = new SelectedRound(selectedSet, selectedLeg, null, null, null);
    }

    this.updateSelectedRound(tmpSelectedRound);
    this.matchUiData.updateSelectedLeg(selectedLeg, this.match.x01MatchSettings.x01, this.checkouts);
    this.scrollContentIntoView();
  }

  private scrollHorizontalCurrentThrower() {
    if (!this.match.currentThrower || !this.container || !this.container.nativeElement || !this.playerInformationContainers) return;

    const currentThrowerIndex = this.match.players.indexOf(
      this.match.players.find(value => value.playerId === this.match.currentThrower)
    );

    const currentThrowerContainer = this.playerInformationContainers.get(currentThrowerIndex);

    if (!currentThrowerContainer) return;

    this.container.nativeElement.scrollLeft = currentThrowerContainer.nativeElement.offsetLeft - 8;
  }

  private scrollCurrentLegTableToBottom() {
    if (!this.timelineTableContainer || !this.timelineTableContainer.nativeElement) return;

    this.timelineTableContainer.nativeElement.scrollTop = this.timelineTableContainer.nativeElement.scrollHeight;
  }

  private scrollContentIntoView() {
    setTimeout(() => {
      this.changeDetector.detectChanges();

      this.scrollCurrentLegTableToBottom();
      this.scrollHorizontalCurrentThrower();
    }, 50);
  }

  private updateMatchUiData() {
    // Update selected round in play.
    const setInPlay = getSetInPlay(this.match);
    const legInPlay = getLegInPlay(setInPlay);

    const newSelectedRound = new SelectedRound(
      setInPlay, legInPlay, getRoundInPlay(legInPlay, this.match.currentThrower), setInPlay, legInPlay
    );

    this.updateSelectedRound(newSelectedRound);

    this.matchUiData = new X01MatchSheetUiData(this.match, newSelectedRound.set?.set, newSelectedRound.legInPlay?.leg, this.checkouts, newSelectedRound.isLegInPlaySelected());

    this.legSelectionFormControl.setValue({set: newSelectedRound.set?.set, leg: newSelectedRound.leg?.leg});
  }

  private updateSelectedRound(selectedRound: SelectedRound) {
    this.selectedRound = selectedRound;
    this.selectedRoundChange.emit(this.selectedRound);
  }
}
