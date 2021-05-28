import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatchService} from '../../../../shared/services/match.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {map, mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {X01Throw} from '../../../../shared/models/x01-throw';
import {IRxStompPublishParams, RxStomp} from '@stomp/rx-stomp';
import {getSet, X01Match} from '../../../../shared/models/x01-match/x01-match';
import {
  NumOfDartsDialogComponent,
  NumOfDartsDialogData
} from '../../../../shared/components/num-of-darts-dialog/num-of-darts-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {X01DeleteThrow} from '../../../../shared/models/x01-delete-throw';
import {X01DeleteSet} from '../../../../shared/models/x01-delete-set';
import {X01DeleteLeg} from '../../../../shared/models/x01-delete-leg';
import {Checkout} from '../../../../shared/models/x01-match/checkout/checkout';
import {WebsocketErrorBody} from '../../../../api/error/websocket-error-body';
import {ApiErrorEnum} from '../../../../api/error/api-error.enum';
import {BasicDialogService} from '../../../../shared/services/basic-dialog-service';
import {TargetErrors} from '../../../../api/error/api-error-body';
import {PlayerType} from '../../../../shared/models/match/player-type';
import {SelectedRound} from '../../components/x01-match-sheet/selected-round';
import {X01DartBotThrow} from '../../../../shared/models/x01-match/x01-dart-bot/x01-dart-bot-throw';
import {ThemeService} from '../../../../shared/services/theme/theme-service';
import {range} from '../../../../shared/helpers/utility';
import {getLeg} from '../../../../shared/models/x01-match/set/x01-set';
import {getRemaining} from '../../../../shared/models/x01-match/leg/x01-leg';

@Component({
  selector: 'app-live-match',
  templateUrl: './live-match.component.html',
  styleUrls: ['./live-match.component.scss']
})
export class LiveMatchComponent implements OnInit, OnDestroy {

  checkouts: Checkout[];
  error = new BehaviorSubject(null);
  isDarkTheme$ = this.themeService.isDarkTheme;
  isScoreboard = true;
  match: X01Match;
  selectedRound: SelectedRound;
  @ViewChild('toggleThemeButton', {read: ElementRef}) toggleThemeButton: ElementRef;
  @ViewChild('toggleScoreboardButton', {read: ElementRef}) toggleScoreboardButton: ElementRef;

  private liveMatchWebsocket: RxStomp;
  private unsubscribe$ = new Subject();

  constructor(private route: ActivatedRoute, private matchService: MatchService, private dialog: MatDialog,
              private basicDialogService: BasicDialogService, private changeDetectorRef: ChangeDetectorRef,
              private themeService: ThemeService, private router: Router) {
    this.initMatch();
  }

  createEditThrow(editScore: { playerId: string, round: number, score: number }): X01Throw {
    return {
      leg: this.selectedRound?.leg.leg,
      matchId: this.match.id,
      playerId: editScore.playerId,
      round: editScore.round,
      score: editScore.score,
      set: this.selectedRound?.set.set,
      dartsUsed: 3
    };
  }

  createNewThrow(scored: number): X01Throw {
    return {
      leg: this.selectedRound?.leg.leg,
      matchId: this.match.id,
      playerId: this.match.currentThrower,
      round: this.selectedRound?.round.round,
      score: scored,
      set: this.selectedRound?.set.set,
      dartsUsed: 3
    };
  }

  publishDeleteLeg(x01DeleteLeg: X01DeleteLeg) {
    console.log(x01DeleteLeg);
    if (this.liveMatchWebsocket.connected) {

      const publishParams: IRxStompPublishParams = {
        body: JSON.stringify(x01DeleteLeg),
        destination: `/topic/matches/${x01DeleteLeg.matchId}:delete-leg`
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.
    }
  }

  publishDartBotThrow(x01DartBotThrow: X01DartBotThrow) {
    console.log(x01DartBotThrow);

    if (this.liveMatchWebsocket.connected) {

      const publishParams: IRxStompPublishParams = {
        body: JSON.stringify(x01DartBotThrow),
        destination: `/topic/matches/${x01DartBotThrow.matchId}:throw-dart-bot`
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.
    }
  }

  publishDeleteSet(x01DeleteSet: X01DeleteSet) {
    console.log(x01DeleteSet);
    if (this.liveMatchWebsocket.connected) {

      const publishParams: IRxStompPublishParams = {
        body: JSON.stringify(x01DeleteSet),
        destination: `/topic/matches/${x01DeleteSet.matchId}:delete-set`
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.
    }
  }

  publishDeleteThrow(x01DeleteThrow: X01DeleteThrow) {
    console.log(x01DeleteThrow);
    if (this.liveMatchWebsocket.connected) {

      const publishParams: IRxStompPublishParams = {
        body: JSON.stringify(x01DeleteThrow),
        destination: `/topic/matches/${x01DeleteThrow.matchId}:delete-throw`
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.liveMatchWebsocket) this.liveMatchWebsocket.deactivate();
  }

  ngOnInit(): void {

  }

  // Remaining is remaining at the start of the throw.
  onScoreSubmit(x01Throw: X01Throw) {

    // Get the remaining at the start of this round.
    const set = getSet(this.match, x01Throw.set);
    const leg = getLeg(set, x01Throw.leg);
    const remaining = getRemaining(leg, x01Throw.playerId, this.match.x01);

    // Get the possible checkout.
    const checkout = this.checkouts.find(value => value.checkout === remaining);

    // When this is the final throw, first open de doubles missed then the final throw dialog.
    if (this.isFinalThrow(x01Throw, this.match)) {
      this.openDoublesMissedDialog(checkout, this.match.trackDoubles, doublesMissed => {
        x01Throw.doublesMissed = doublesMissed;
        this.openFinalThrowDialog(checkout, dartsUsed => {
          x01Throw.dartsUsed = dartsUsed;
          this.publishScore(x01Throw);
        });
      });
    } else if (checkout) { // When a checkout could have been scored open the doubles missed dialog.
      this.openDoublesMissedDialog(checkout, this.match.trackDoubles, doublesMissed => {
        x01Throw.doublesMissed = doublesMissed;
        this.publishScore(x01Throw);
      });
    } else { // When no checkout could have been scored publish the score.
      this.publishScore(x01Throw);
    }
  }

  toggleScoreboard() {
    this.isScoreboard = !this.isScoreboard;
    this.toggleScoreboardButton.nativeElement.blur();
    this.changeDetectorRef.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.toggleThemeButton.nativeElement.blur();
  }

  private checkDartBotTurn() {
    const currentThrower = this.match.players.find(matchPlayer => matchPlayer.playerId === this.match.currentThrower);

    if (currentThrower?.playerType === PlayerType.DART_BOT) {
      setTimeout(() => {
        this.publishDartBotThrow({
          dartBotId: currentThrower.playerId,
          leg: this.selectedRound.leg.leg,
          matchId: this.match.id,
          round: this.selectedRound.round.round,
          set: this.selectedRound.set.set
        });
      }, 300);
    }
  }

  private handleErrorQueue(websocketError: WebsocketErrorBody) {
    console.log(websocketError);
    switch (websocketError?.error) {
      case ApiErrorEnum.INTERNAL:
      case ApiErrorEnum.MESSAGE_NOT_READABLE: {
        this.basicDialogService.createInternalErrorDialog();
        break;
      }
      case ApiErrorEnum.UNAVAILABLE: {
        this.basicDialogService.createWebsocketNoConnectionErrorDialog(false);
        break;
      }
      case ApiErrorEnum.RESOURCE_NOT_FOUND: {
        this.basicDialogService.createResourceNotFoundErrorDialog('match');
        break;
      }
      case ApiErrorEnum.INVALID_ARGUMENTS: {
        this.handleErrorQueueInvalidArguments(websocketError.details);
        break;
      }
    }
  }

  private handleErrorQueueInvalidArguments(details: TargetErrors) {
    if (!details) return;

    let error: string;
    const errorKey = Object.keys(details)[0];

    switch (errorKey) {
      case 'score': {
        error = `Scoring error: ${details[errorKey]}`;
        break;
      }
      case 'dartsUsed': {
        error = `Darts used error: ${details[errorKey]}`;
        break;
      }
      case 'set': {
        error = `Set error: ${details[errorKey]}`;
        break;
      }
      case 'leg': {
        error = `Leg error: ${details[errorKey]}`;
        break;
      }
      case 'round': {
        error = `Round error: ${details[errorKey]}`;
        break;
      }
      case 'doublesMissed': {
        error = `Missed doubles error: ${details[errorKey]}`;
        break;
      }
      default:
        error = 'Oops, something went wrong, please try again or contact us.';
    }

    this.error.next(error);
  }

  private initMatch() {
    this.liveMatchWebsocket = this.matchService.getLiveMatchWebsocket();
    this.liveMatchWebsocket.activate();

    this.subscribeErrorQueue();
    this.subscribeMatchTopic();
  }

  private isFinalThrow(x01Throw: X01Throw, match: X01Match): boolean {
    const leg = this.selectedRound.leg;

    if (!leg) return false;

    let playerScore = 0;
    leg.rounds.forEach(x01LegRound => {
      const playerLegRoundScore = x01LegRound.playerScores.find(legRoundScore => legRoundScore.playerId === x01Throw.playerId);

      if (x01LegRound.round !== x01Throw.round && playerLegRoundScore) playerScore += playerLegRoundScore.score;
    });

    return match.x01 - (playerScore + x01Throw.score) === 0;
  }

  private openFinalThrowDialog(checkout: Checkout, onSubmit: (dartsUsed: number) => void) {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {

      if (!checkout) {
        onSubmit(3);
        return;
      }

      const dialogData: NumOfDartsDialogData = {
        title: 'Darts used final throw',
        options: range(checkout.minDarts, 3)
      };

      this.dialog.open(NumOfDartsDialogComponent, {data: dialogData})
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(dartsUsed => {
          if (dartsUsed !== undefined) onSubmit(dartsUsed);
        });
    }
  }

  private openDoublesMissedDialog(checkout: Checkout, doublesTracking: boolean, onSubmit: (doublesMissed: number) => void) {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {

      if (!doublesTracking || !checkout) {
        onSubmit(0);
        return;
      }

      const dialogData: NumOfDartsDialogData = {
        title: 'Double(s) checkout missed',
        options: range(0, 3)
      };

      this.dialog.open(NumOfDartsDialogComponent, {data: dialogData})
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(doublesMissed => {
          if (doublesMissed !== undefined) onSubmit(doublesMissed);
        });
    }
  }

  private publishScore(x01Throw: X01Throw) {
    console.log(x01Throw);

    if (this.liveMatchWebsocket.connected) {

      const publishParams: IRxStompPublishParams = {
        body: JSON.stringify(x01Throw),
        destination: `/topic/matches/${x01Throw.matchId}:update`
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.
    }
  }

  private subscribeErrorQueue() {
    // Subscribe to error queue.
    this.liveMatchWebsocket.watch(`/user/queue/errors`)
      .pipe(
        takeUntil(this.unsubscribe$),
        map(value => JSON.parse(value.body) as WebsocketErrorBody)
      )
      .subscribe(websocketErrorBody => {
        this.handleErrorQueue(websocketErrorBody);
      }, error => console.log(error));
  }

  private subscribeMatchTopic() {
    // Subscribe to match topic.
    this.matchService.getCheckouts().pipe(
      takeUntil(this.unsubscribe$),
      switchMap(checkouts => {
        this.checkouts = checkouts;

        return this.route.params.pipe(
          mergeMap(params => {
            return this.liveMatchWebsocket.watch(`/topic/matches/${params.id}`).pipe(
              takeUntil(this.unsubscribe$),
              map(value => JSON.parse(value.body) as X01Match)
            );
          }),
        );
      }),
    ).subscribe(match => {
      console.log(match);

      this.match = match;
      this.error.next(null);
      this.changeDetectorRef.detectChanges();
      this.checkDartBotTurn();

    }, error => {
      console.log(error);
    });
  }
}
