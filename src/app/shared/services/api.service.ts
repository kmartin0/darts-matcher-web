import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RxStomp, RxStompConfig} from '@stomp/rx-stomp';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  makePost<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  makePostFormUrlEncoded<T>(url: string, body: HttpParams): Observable<T> {
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    return this.http.post<T>(url, body ? body.toString() : null, {headers});
  }

  makeGet<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  makeDelete(url: string): Observable<any> {
    return this.http.delete(url);
  }

  makePut<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  makeWebsocket(url: string): RxStomp {
    const rxStompConfig = new RxStompConfig();
    rxStompConfig.reconnectDelay = 2000;
    rxStompConfig.brokerURL = url;

    const rxStomp = new RxStomp();
    rxStomp.configure(rxStompConfig);

    return rxStomp;
  }

}
