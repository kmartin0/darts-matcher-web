import {Injectable} from '@angular/core';
import {RxStomp} from '@stomp/rx-stomp';
import {isApiErrorBody} from '../error/api-error-body';
import {ApiErrorEnum} from '../error/api-error.enum';
import {LoginFormDialogComponent} from '../../shared/components/login-form-dialog/login-form-dialog.component';
import {UserService} from '../../shared/services/user.service';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class WebSocketAuthenticationService {

  constructor(private userService: UserService, private matDialog: MatDialog) {
  }

  connectAuthInterceptor(webSocket: RxStomp) {

    webSocket.stompClient.connectHeaders = {
      ...webSocket.stompClient.connectHeaders,
      Authorization: `${this.userService.getLoggedInUserOAuth2().access_token}`
    };

    webSocket.stompErrors$.subscribe(value => {
      console.log(value);

      if (value?.body) {
        const body = JSON.parse(value.body);
        if (isApiErrorBody(body) && body.error === ApiErrorEnum.UNAUTHENTICATED) {
          this.refreshToken(webSocket);
        }
      }

    }, error => {
      console.log(error);
    });

  }

  private refreshToken(webSocket: RxStomp) {
    this.userService.refreshToken().subscribe(() => {
      this.retryConnect(webSocket);
    }, () => {
      webSocket.deactivate().then(() => {
        this.retryLogin(webSocket);
      });
    });
  }

  private retryLogin(webSocket: RxStomp) {
    const loginDialog = this.matDialog.open(LoginFormDialogComponent);

    loginDialog.afterClosed().subscribe(success => {
        success ? this.retryConnect(webSocket) : this.userService.logoutUser();
      }
    );
  }

  private retryConnect(webSocket: RxStomp) {
    webSocket.stompClient.connectHeaders = {
      ...webSocket.stompClient.connectHeaders,
      Authorization: `${this.userService.getLoggedInUserOAuth2().access_token}`
    };

    webSocket.activate();
  }

}
