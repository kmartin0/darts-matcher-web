import {Injectable} from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree, Router
} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../../shared/services/user.service';
import {UNAUTHENTICATED} from '../../shared/constants/web-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isUserLoggedIn();
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.isUserLoggedIn();
  }

  private isUserLoggedIn(): boolean {
    if (this.userService.getLoggedInUserOAuth2()) {
      return true;
    } else {
      this.navigateToUnauthenticated();
      return false;
    }

  }

  private navigateToUnauthenticated() {
    const path = window.location.pathname;

    this.router.navigateByUrl(UNAUTHENTICATED, {skipLocationChange: true, replaceUrl: true}).then(r => {
      window.history.replaceState(null, null, path); // Workaround to keep url in browser, side effect url blinks once.
    });
  }
}
