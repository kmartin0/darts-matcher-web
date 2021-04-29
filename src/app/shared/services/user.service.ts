import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {User} from '../models/user';
import {Observable} from 'rxjs';
import {GET_AUTHENTICATED_USER, GET_USER_BY_ID, LOGIN, SAVE_USER} from '../../api/api-endpoints';
import {UserAuthentication} from '../models/user-authentication';
import {Oauth2Credentials} from '../models/oauth2-credentials';
import {tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {HOME} from '../constants/web-endpoints';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService, private router: Router) {
  }

  registerUser(user: User): Observable<User> {
    return this.apiService.makePost<User>(SAVE_USER, user);
  }

  loginUser(userAuthentication: UserAuthentication): Observable<Oauth2Credentials> {
    return this.authenticateUser(userAuthentication).pipe(
      tap(credentials => {
        this.persistOAuth2Credentials(credentials);
      })
    );
  }

  authenticateUser(userAuthentication: UserAuthentication): Observable<Oauth2Credentials> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('username', userAuthentication.email)
      .set('password', userAuthentication.password);

    return this.apiService.makePostFormUrlEncoded<Oauth2Credentials>(LOGIN, body);
  }

  persistOAuth2Credentials(oauth2Credentials: Oauth2Credentials) {
    if (!oauth2Credentials.access_token.startsWith('Bearer')) {
      oauth2Credentials.access_token = `Bearer ${oauth2Credentials.access_token}`;
    }

    localStorage.setItem(STORAGE_OAUTH2_CREDENTIALS_KEY, JSON.stringify(oauth2Credentials));
  }

  getLoggedInUserOAuth2(): Oauth2Credentials {
    return JSON.parse(localStorage.getItem(STORAGE_OAUTH2_CREDENTIALS_KEY));
  }

  logoutUser() {
    localStorage.removeItem(STORAGE_OAUTH2_CREDENTIALS_KEY);
    this.router.navigate([HOME]);
  }

  getLoggedInUser(): Observable<User> {
    return this.apiService.makeGet(GET_AUTHENTICATED_USER);
  }

  getUserById(id: string): Observable<User> {
    return this.apiService.makeGet(GET_USER_BY_ID(id));
  }
}

export const STORAGE_OAUTH2_CREDENTIALS_KEY = 'logged_in_user_oauth2';
