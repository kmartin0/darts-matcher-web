import {Injectable} from '@angular/core';
import {RxStomp} from '@stomp/rx-stomp';
import {ApiService} from './api.service';
import {WebSocketAuthenticationService} from '../../api/web-socket/web-socket-authentication.service';
import {GET_DARTS_MATCHER_WEBSOCKET} from '../../api/web-socket-endpoints';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  constructor(private apiService: ApiService, private webSocketAuthentication: WebSocketAuthenticationService) {
  }

  getFriendRequestsWebSocket(): RxStomp {
    const webSocket = this.apiService.makeWebsocket(GET_DARTS_MATCHER_WEBSOCKET);
    this.webSocketAuthentication.connectAuthInterceptor(webSocket);

    return webSocket;
  }

  getFriendsWebSocket(): RxStomp {
    const webSocket = this.apiService.makeWebsocket(GET_DARTS_MATCHER_WEBSOCKET);
    this.webSocketAuthentication.connectAuthInterceptor(webSocket);

    return webSocket;
  }
}
