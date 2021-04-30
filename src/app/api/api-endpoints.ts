import {X01Match} from '../shared/models/x01-match/x01-match';
import {Observable} from 'rxjs';
import {RxStomp} from '@stomp/rx-stomp';
import {Checkout} from '../shared/models/x01-match/checkout/checkout';
import {environment} from '../../environments/environment';

// export const BASE_URL = 'http://localhost:8080';
// export const BASE_URL_WEBSOCKET = 'ws://localhost:8080';
// export const BASE_URL = 'http://192.168.1.17:8080';
// export const BASE_URL_WEBSOCKET = 'ws://192.168.1.17:8080';

export const BASE_URL = environment.dartsMatcherApiUrl;
export const BASE_URL_WEBSOCKET = environment.dartsMatcherWebsocketUrl;

// Auth endpoints
export const LOGIN = `${BASE_URL}/oauth/token`;

// User endpoints¶
export const SAVE_USER = `${BASE_URL}/users`;
export const GET_AUTHENTICATED_USER = `${BASE_URL}/users`;
export const GET_USER_BY_ID = (id: string) => `${BASE_URL}/users/${id}`;

// Matches endpoints
export const CREATE_MATCH = `${BASE_URL}/matches`;
export const GET_MATCH = (id: string) => `${BASE_URL}/matches/${id}`;
export const GET_DARTS_MATCHER_WEBSOCKET = `${BASE_URL_WEBSOCKET}/darts-matcher-websocket/websocket`;
export const GET_CHECKOUTS = `${BASE_URL}/checkouts`;
