import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {WebsocketErrorBody} from '../../../../api/error/websocket-error-body';
import {
  ERROR_QUEUE,
  X01_MATCH_TOPIC_REQUEST_REPLY,
  X01_MATCH_TOPIC_SUBSCRIPTION
} from '../../../../api/web-socket-endpoints';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {RxStomp, RxStompState} from '@stomp/rx-stomp';
import {BehaviorSubject, merge, Subject, Subscription} from 'rxjs';
import {MatchService} from '../../../../shared/services/match.service';
import {ActivatedRoute} from '@angular/router';
import {MatchStatus} from '../../../../shared/models/match/match-status';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnDestroy {

  matchWebSocket: RxStomp = this.matchService.getLiveMatchWebsocket();
  private unsubscribe$ = new Subject();

  x01Match$ = new BehaviorSubject<X01Match>(null);
  webSocketError$ = new BehaviorSubject<WebsocketErrorBody>(null);

  matchStatuses = MatchStatus;

  private errorQueueSubscription?: Subscription;
  private matchTopicSubscription?: Subscription;

  constructor(private matchService: MatchService, private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) {
    this.initWebSocket();
  }

  initWebSocket() {
    this.matchWebSocket.connectionState$.subscribe(connectionState => {
      console.log(RxStompState[connectionState]);
      if (connectionState === RxStompState.OPEN) {
        this.subscribeErrorQueue();
        this.subscribeMatchTopic();
      }
    });

    this.matchWebSocket.activate();
  }

  private subscribeMatchTopic() {
    this.matchTopicSubscription?.unsubscribe();

    // Subscribe to match topic.
    this.matchTopicSubscription = this.route.params.pipe(
      switchMap(params => {
        return merge(
          this.matchWebSocket.watch(X01_MATCH_TOPIC_REQUEST_REPLY(params.id)).pipe(
            takeUntil(this.unsubscribe$),
            map(value => JSON.parse(value.body) as X01Match)
          ),
          this.matchWebSocket.watch(X01_MATCH_TOPIC_SUBSCRIPTION(params.id)).pipe(
            takeUntil(this.unsubscribe$),
            map(value => JSON.parse(value.body) as X01Match)
          )
        );
      }),
    ).subscribe(match => {
      console.log(match);
      this.x01Match$.next(match as X01Match);
      this.changeDetectorRef.detectChanges();
    }, error => {
      console.log(error);
    });
  }

  private subscribeErrorQueue() {
    this.errorQueueSubscription?.unsubscribe();

    // Subscribe to error queue.
    this.errorQueueSubscription = this.matchWebSocket.watch(ERROR_QUEUE)
      .pipe(
        takeUntil(this.unsubscribe$),
        map(value => JSON.parse(value.body) as WebsocketErrorBody)
      )
      .subscribe(websocketErrorBody => {
        console.log(websocketErrorBody);
        this.webSocketError$.next(websocketErrorBody);
      }, error => console.log(error));
  }

  ngOnDestroy() {
    if (this.matchWebSocket) {
      this.matchWebSocket.deactivate().then(() => {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
      });
    }
  }

}
