import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ApiErrorInterceptor} from '../../api/interceptor/api-error.interceptor';
import {ApiLoggingInterceptor} from '../../api/interceptor/api-logging.interceptor';
import {ApiAuthHeaderInterceptor} from '../../api/interceptor/api-auth-header.interceptor';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ApiAuthHeaderInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ApiLoggingInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
