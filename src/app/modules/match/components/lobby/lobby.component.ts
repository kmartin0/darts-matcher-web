import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {IRxStompPublishParams, RxStomp} from '@stomp/rx-stomp';
import {WebsocketErrorBody} from '../../../../api/error/websocket-error-body';
import {MatDialog} from '@angular/material/dialog';
import {ThemeService} from '../../../../shared/services/theme/theme-service';
import {X01_START_MATCH_TOPIC, X01_UPDATE_MATCH_TOPIC} from '../../../../api/web-socket-endpoints';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {BasicDialogService} from '../../../../shared/services/basic-dialog.service';
import {MatchFormComponent} from '../../../../shared/components/match-form/match-form.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  isDarkTheme$ = this.themeService.isDarkTheme;
  match: X01Match;

  @Input() liveMatchWebsocket: RxStomp;
  @Input() match$: Observable<X01Match>;
  @Input() websocketError$: Observable<WebsocketErrorBody>;

  @ViewChild(MatchFormComponent, {static: false}) private matchFormComponent: MatchFormComponent;


  private unsubscribe$ = new Subject();

  constructor(private dialog: MatDialog, private themeService: ThemeService, private changeDetectorRef: ChangeDetectorRef, private dialogService: BasicDialogService) {
  }

  ngOnInit(): void {
    this.subscribeMatch();
    this.initFormChangesListener();
  }

  private subscribeMatch() {
    this.match$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(value => {
      console.log(value);
      this.match = value;
      // this.error.next(null);
      this.changeDetectorRef.detectChanges();

    }, error1 => console.log(error1));
  }

  private initFormChangesListener() {
    this.matchFormComponent.form.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      debounceTime(1000),
      distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
    ).subscribe(matchForm => {
      console.log(matchForm);
      this.matchFormComponent.onSubmitForm();
    });
  }

  publishUpdate(match: X01Match) {
    console.log(match);

    if (this.match && this.liveMatchWebsocket.connected) {
      const publishParams: IRxStompPublishParams = {
        body: JSON.stringify(match),
        destination: X01_UPDATE_MATCH_TOPIC(this.match.id)
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.

    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  startMatch() {
    if (this.match && this.liveMatchWebsocket.connected) {
      const publishParams: IRxStompPublishParams = {
        body: '',
        destination: X01_START_MATCH_TOPIC(this.match.id)
      };

      this.liveMatchWebsocket.publish(publishParams);
    } else {
      // TODO: For some reason broker is not connected.

    }
  }

  openStartMatchDialog() {
    this.dialogService.createBasicDialog({
      title: 'Are you sure you want to start the match?', content: 'This action cannot be undone.'
    }).afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(ok => {
        if (ok) {
          this.startMatch();
        }
      });
  }

}
