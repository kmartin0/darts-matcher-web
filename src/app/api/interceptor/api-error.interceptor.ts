import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError, switchMap,} from 'rxjs/operators';
import {UserService} from '../../shared/services/user.service';
import {ApiErrorBody, isApiErrorBody} from '../error/api-error-body';
import {BasicDialogService} from '../../shared/services/basic-dialog.service';
import {ApiErrorEnum} from '../error/api-error.enum';
import {MatDialog} from '@angular/material/dialog';
import {LoginFormDialogComponent} from '../../shared/components/login-form-dialog/login-form-dialog.component';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  constructor(private userService: UserService, private dialogService: BasicDialogService, private matDialog: MatDialog) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        return this.handleError(err, next, req);
      })
    );
  }

  private handleError(httpErrorResponse, next, req): Observable<any> {
    const apiError = httpErrorResponse.error;

    if (isApiErrorBody(apiError)) return this.handleApiErrorBody(httpErrorResponse, apiError);
    else return this.handleUnknownErrorBody(httpErrorResponse, next, req);
  }

  private handleApiErrorBody(httpErrorResponse, apiErrorBody: ApiErrorBody): Observable<any> {
    switch (apiErrorBody.error) {
      case ApiErrorEnum.URI_NOT_FOUND: {
        this.dialogService.createUriNotFoundErrorDialog(true);
        break;
      }
      case ApiErrorEnum.MESSAGE_NOT_READABLE:
      case ApiErrorEnum.METHOD_NOT_ALLOWED:
      case ApiErrorEnum.UNSUPPORTED_MEDIA_TYPE:
      case ApiErrorEnum.INTERNAL: {
        this.dialogService.createInternalErrorDialog(true);
        break;
      }
      case ApiErrorEnum.UNAVAILABLE: {
        this.dialogService.createUnavailableErrorDialog(true);
      }
    }

    return throwError(httpErrorResponse.error);
  }

  private handleUnknownErrorBody(httpErrorResponse, next, req) {
    if (httpErrorResponse.status === 401) {
      return this.handleUnauthorized(httpErrorResponse, next, req);
    } else {
      if (httpErrorResponse.status === 0) this.dialogService.createUnavailableErrorDialog(true);
      else this.dialogService.createInternalErrorDialog(true);

      return throwError(httpErrorResponse.error);
    }
  }

  private handleUnauthorized(httpErrorResponse, next, req) {
    const wwwAuthenticate = httpErrorResponse.headers.get('WWW-Authenticate');

    // When the token is invalid retry login and retry the request. All other unauthorized requests prompt a login.
    if (wwwAuthenticate.includes('error=\"invalid_token\"')) {
      return this.userService.refreshToken().pipe(
        switchMap(credentials => {
          return next.handle(req) as Observable<HttpEvent<any>>;
        }),
        catchError(err => {
          return this.retryLogin(req, next); // If the token can't be refreshed then prompt the user to login again.
        })
      );

    } else {
      return this.retryLogin(req, next);
    }
  }

  private retryLogin(req, next) {
    const loginDialog = this.matDialog.open(LoginFormDialogComponent, {disableClose: true});

    return loginDialog.afterClosed().pipe(
      switchMap(success => {
          if (success) {
            return next.handle(req) as Observable<HttpEvent<any>>;
          } else {
            this.userService.logoutUser();
            return EMPTY;
          }
        }
      )
    );
  }
}
