import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {IRxStompPublishParams, RxStomp} from '@stomp/rx-stomp';
import {WebsocketErrorBody} from '../../../../api/error/websocket-error-body';
import {MatDialog} from '@angular/material/dialog';
import {ThemeService} from '../../../../shared/services/theme/theme-service';
import {X01_DELETE_LEG_TOPIC, X01_START_MATCH_TOPIC} from '../../../../api/web-socket-endpoints';
import {switchMap, takeUntil} from 'rxjs/operators';
import {MatchService} from '../../../../shared/services/match.service';
import {BasicDialogService} from '../../../../shared/services/basic-dialog.service';

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

  private unsubscribe$ = new Subject();

  constructor(private dialog: MatDialog, private themeService: ThemeService, private changeDetectorRef: ChangeDetectorRef, private dialogService: BasicDialogService) {
  }

  ngOnInit(): void {
    this.subscribeMatch();
  }

  private subscribeMatch() {
    this.match$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(value => {
      this.match = value;
      // this.error.next(null);
      this.changeDetectorRef.detectChanges();

    }, error1 => console.log(error1));
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  startMatch() {
    if (this.match && this.liveMatchWebsocket.connected) {
      console.log('published');
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
