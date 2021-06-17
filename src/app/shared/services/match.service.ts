import {Injectable} from '@angular/core';
import {X01Match} from '../models/x01-match/x01-match';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {RxStomp} from '@stomp/rx-stomp';
import {Checkout} from '../models/x01-match/checkout/checkout';
import {CREATE_MATCH, GET_CHECKOUTS, GET_MATCH} from '../../api/api-endpoints';
import {GET_DARTS_MATCHER_WEBSOCKET} from '../../api/web-socket-endpoints';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private apiService: ApiService) {
  }

  createMatch(match: X01Match): Observable<X01Match> {
    return this.apiService.makePost(CREATE_MATCH, match);
  }

  getMatch(id: string): Observable<X01Match> {
    return this.apiService.makeGet(GET_MATCH(id));
  }

  getLiveMatchWebsocket(): RxStomp {
    return this.apiService.makeWebsocket(GET_DARTS_MATCHER_WEBSOCKET);
  }

  getCheckouts(): Observable<Checkout[]> {
    return this.apiService.makeGet(GET_CHECKOUTS);
  }
}
