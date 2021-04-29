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
import {getSetInPlay, X01Match} from '../../../../shared/models/x01-match/x01-match';
import {UserService} from '../../../../shared/services/user.service';
import {User} from '../../../../shared/models/user';
import {X01MatchSheetUiData} from './x01-match-sheet-ui-data';
import {PlayerType} from '../../../../shared/models/match/player-type';
import {getLegInPlay, X01Set} from '../../../../shared/models/x01-match/set/x01-set';
import {X01Leg} from '../../../../shared/models/x01-match/leg/x01-leg';
import {FormControl} from '@angular/forms';
import {Observable, of, Subject, zip} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';
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

@Component({
  selector: 'app-x01-match-sheet',
  templateUrl: './x01-match-sheet.component.html',
  styleUrls: ['./x01-match-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class X01MatchSheetComponent implements OnChanges, OnInit, OnDestroy {

  selectedRound: { set: number, leg: number, round: number };

  private registeredPlayers: User[] = [];

  @Input() checkouts: Checkout[];
  @Input() match: X01Match;

  @Output() deleteThrow = new EventEmitter<X01DeleteThrow>();
  @Output() deleteSet = new EventEmitter<X01DeleteSet>();
  @Output() deleteLeg = new EventEmitter<X01DeleteLeg>();
  @Output() editScore = new EventEmitter<{ playerId: string, round: number, score: number }>();
  @Output() selectedRound$ = new EventEmitter<{ set: number, leg: number, round: number }>();

  @ViewChild('container') container: ElementRef;
  @ViewChildren('playerInformationContainer', {read: ElementRef}) playerInformationContainers: QueryList<ElementRef>;
  @ViewChild('timelineTableContainer', {read: ElementRef}) timelineTableContainer: ElementRef;

  matchUiData: X01MatchSheetUiData;
  modeEdit = false;
  selectedLeg = new FormControl({set: 0, leg: 0});
  sectionAreas = SectionArea;
  unsubscribe$ = new Subject();

  setInPlay: X01Set;
  legInPlay: X01Leg;

  get middleOrder(): number {
    if (!this.match || !this.match.players) return null;
    return Math.floor((this.match.players.length - 1) / 2);
  }

  constructor(private userService: UserService, private changeDetector: ChangeDetectorRef, private dialog: MatDialog) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.match && changes.match.currentValue) {
      this.updateRegisteredPlayers().subscribe(() => {
        this.updateMatchUiData();
        this.emitSelectedRound();
        this.scrollContentIntoView();
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.selectedLeg.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.onSelectedLegChange();
    });
  }

  onEditSetLegClick() {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {

      const selectLegValue = this.selectedLeg.value;
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
      const selectLegValue = this.selectedLeg.value;
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

  private emitSelectedRound() {
    let selectedRound = 1;
    if (this.match.timeline) {
      if (this.match.result.find(result => result.result)) {
        selectedRound = 0;
      } else {
        const leg = this.getSelectedLeg();
        if (leg && leg.rounds) {
          const roundWithoutCurrentThrower = leg.rounds.find(legRound => {
            return !legRound.playerScores.find(playerScore => playerScore.playerId === this.match.currentThrower);
          });

          if (roundWithoutCurrentThrower) {
            selectedRound = roundWithoutCurrentThrower.round;
          } else {
            selectedRound = leg.rounds.reduce((previousValue, currentValue) => previousValue.round > currentValue.round ? previousValue : currentValue).round + 1;
          }
        }
      }
    }

    this.selectedRound = {
      set: this.selectedLeg.value.set,
      leg: this.selectedLeg.value.leg,
      round: selectedRound
    };

    this.selectedRound$.emit(this.selectedRound);
  }

  private getSelectedLeg(): X01Leg {
    const legNumber = this.selectedLeg.value.leg;

    return this.getSelectedSet().legs.find(leg => leg.leg === legNumber);
  }

  private getSelectedSet(): X01Set {
    const setNumber = this.selectedLeg.value.set;

    return this.match.timeline.find(set => set.set === setNumber);
  }

  private isLegInPlaySelected(): boolean {
    return this.setInPlay.set === this.selectedRound?.set && this.legInPlay.leg === this.selectedRound?.leg;
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
    this.emitSelectedRound();
    this.matchUiData.updateSelectedLeg(this.getSelectedLeg(), this.match.x01, this.checkouts);
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
    this.setInPlay = getSetInPlay(this.match);
    this.legInPlay = getLegInPlay(this.setInPlay);

    this.matchUiData = new X01MatchSheetUiData(this.match, this.registeredPlayers, this.setInPlay.set, this.legInPlay.leg, this.checkouts, this.isLegInPlaySelected());

    this.selectedLeg.setValue({set: this.setInPlay.set, leg: this.legInPlay.leg});
  }

  private updateRegisteredPlayers(): Observable<User[]> {
    const registeredMatchPlayerIds = this.match.players.filter(value => value.playerType === PlayerType.REGISTERED)?.map(value => value.playerId);
    const registeredMatchPlayerIdsCache = this.registeredPlayers?.map(value => value.id);

    if (registeredMatchPlayerIds.length === registeredMatchPlayerIdsCache.length && registeredMatchPlayerIds.every((value, index) => value === registeredMatchPlayerIdsCache[index])) {
      return of(this.registeredPlayers);
    } else {
      const getUsers$ = registeredMatchPlayerIds.map(playerId => this.userService.getUserById(playerId));
      return zip(...getUsers$).pipe(takeUntil(this.unsubscribe$), tap(registeredUsers => {
        this.registeredPlayers = registeredUsers;
      }));
    }
  }

}
