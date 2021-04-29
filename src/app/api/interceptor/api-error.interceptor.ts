import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError,} from 'rxjs/operators';
import {UserService} from '../../shared/services/user.service';
import {isApiErrorBody} from '../error/api-error-body';


@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        return this.handleError(err, req, next);
      })
    );
  }

  handleError = (httpErrorResponse, req, next) => {
    // if (isApiErrorBody(httpErrorResponse)) return throwError(httpErrorResponse.error)
    return throwError(httpErrorResponse.error);
  }
}
