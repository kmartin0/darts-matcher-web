import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatchService} from '../../../../shared/services/match.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {map, mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {X01Throw} from '../../../../shared/models/x01-throw';
import {IRxStompPublishParams, RxStomp} from '@stomp/rx-stomp';
import {getLeg, getSetInPlay, X01Match} from '../../../../shared/models/x01-match/x01-match';
import {
  FinalThrowDialogComponent,
  FinalThrowDialogData
} from '../../../../shared/components/final-throw-dialog/final-throw-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {getLegInPlay, X01Set} from '../../../../shared/models/x01-match/set/x01-set';
import {X01Leg} from '../../../../shared/models/x01-match/leg/x01-leg';
import {X01DeleteThrow} from '../../../../shared/models/x01-delete-throw';
import {X01DeleteSet} from '../../../../shared/models/x01-delete-set';
import {X01DeleteLeg} from '../../../../shared/models/x01-delete-leg';
import {Checkout} from '../../../../shared/models/x01-match/checkout/checkout';
import {WebsocketErrorBody} from '../../../../api/error/websocket-error-body';
import {ApiErrorEnum} from '../../../../api/error/api-error.enum';
import {BasicDialogService} from '../../../../shared/services/basic-dialog-service';
import {TargetErrors} from '../../../../api/error/api-error-body';
import {PlayerType} from '../../../../shared/models/match/player-type';

@Component({
  selector: 'app-live-match',
  templateUrl: './live-match.component.html',
  styleUrls: ['./live-match.component.scss']
})
export class LiveMatchComponent implements OnInit, OnDestroy {

  selectedRound: { set: number, leg: number, round: number };

  checkouts: Checkout[];
  error = new BehaviorSubject(null);
  legInPlay: X01Leg;
  match: X01Match;
  setInPlay: X01Set;

  private liveMatchWebsocket: RxStomp;
  private unsubscribe$ = new Subject();

  constructor(private route: ActivatedRoute, private matchService: MatchService, private dialog: MatDialog, private basicDialogService: BasicDialogService, private changeDetectorRef: ChangeDetectorRef) {
    this.initMatch();
  }

  createEditThrow(editScore: { playerId: string, round: number, score: number }): X01Throw {
    return {
      leg: this.selectedRound.leg,
      matchId: this.match.id,
      playerId: editScore.playerId,
      round: editScore.round,
      score: editScore.score,
      set: this.selectedRound.set,
      dartsUsed: 3
    };
  }

  createNewThrow(scored: number): X01Throw {
    return {
      leg: this.selectedRound.leg,
      matchId: this.match.id,
      playerId: this.match.currentThrower,
      round: this.selectedRound.round,
      score: scored,
      set: this.selectedRound.set,
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

  // publishDartBotThrow(dartBotId: string) {
  //   console.log('DartBot throwing: ' + dartBotId);
  //
  //   if (this.liveMatchWebsocket.connected) {
  //
  //     const publishParams: IRxStompPublishParams = {
  //       body: JSON.stringify(x01DeleteLeg),
  //       destination: `/topic/matches/${x01DeleteLeg.matchId}:delete-leg`
  //     };
  //
  //     this.liveMatchWebsocket.publish(publishParams);
  //   } else {
  //     // TODO: For some reason broker is not connected.
  //   }
  // }

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

  onScoreSubmit(x01Throw: X01Throw) {
    if (this.isFinalThrow(x01Throw, this.match)) {
      this.openFinalThrowDialog(x01Throw.score, dartsUsed => {
        x01Throw.dartsUsed = dartsUsed;
        this.publishScore(x01Throw);
      });
    } else {
      this.publishScore(x01Throw);
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
    const leg = getLeg(match, x01Throw.set, x01Throw.leg);

    if (!leg) return false;

    let playerScore = 0;
    leg.rounds.forEach(x01LegRound => {
      const playerLegRoundScore = x01LegRound.playerScores.find(legRoundScore => legRoundScore.playerId === x01Throw.playerId);

      if (x01LegRound.round !== x01Throw.round && playerLegRoundScore) playerScore += playerLegRoundScore.score;
    });

    return match.x01 - (playerScore + x01Throw.score) === 0;
  }

  private openFinalThrowDialog(checkout: number, onSubmit: (dartsUsed: number) => void) {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) {

      const dialogData: FinalThrowDialogData = {
        minDarts: this.checkouts.find(value => value.checkout === checkout)?.minDarts
      };

      this.dialog.open(FinalThrowDialogComponent, {data: dialogData})
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(dartsUsed => {
          if (dartsUsed) onSubmit(dartsUsed);
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
      this.setInPlay = getSetInPlay(match);
      this.legInPlay = getLegInPlay(this.setInPlay);
      this.error.next(null);
      this.changeDetectorRef.detectChanges();

    }, error => {
      console.log(error);
    });
  }

  private checkDartBotTurn() {
    const currentThrower = this.match.players.find(matchPlayer => matchPlayer.playerId === this.match.currentThrower);

    if (currentThrower?.playerType === PlayerType.DART_BOT) {

    }
  }

}
