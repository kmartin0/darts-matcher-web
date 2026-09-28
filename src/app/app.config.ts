import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideRouter, RouteReuseStrategy, withComponentInputBinding} from '@angular/router';
import {MAT_ICON_DEFAULT_OPTIONS} from '@angular/material/icon';
import {AppStore} from './app-store';
import {routes} from './app.routes';
import {GlobalErrorHandler} from './global-error-handler';
import {httpErrorInterceptor} from '../data/api/http/http-error.interceptor';
import {httpLoggingInterceptor} from '../data/api/http/http-logging.interceptor';
import {AppRouteReuseStrategy} from './app-route-reuse-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    provideHttpClient(
      withInterceptors([
        httpErrorInterceptor,
        httpLoggingInterceptor
      ])
    ),
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    {provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy},
    {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'material-symbols-outlined'}},
    provideAppInitializer(() => {
      // Initialize the application store before the application starts.
      inject(AppStore);
    })
  ]
};
