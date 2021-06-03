import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LOGIN} from '../api-endpoints';
import {UserService} from '../../shared/services/user.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class ApiAuthHeaderInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = req.url;

    // Add basic authorization header for token requests.
    if (url === LOGIN) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', 'Basic ' + btoa(`${environment.clientId}:${environment.clientSecret}`))
      });

      return next.handle(authReq);
    }
    // Add bearer authorization for logged in users.
    const loggedInUser = this.userService.getLoggedInUserOAuth2();
    if (loggedInUser) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', loggedInUser.access_token)
      });

      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
