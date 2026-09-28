import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, BaseRouteReuseStrategy} from '@angular/router';
import {MatchPage} from '../features/match/pages/match-page/match-page';

/**
 * Determines whether the current routed component can be reused.
 */
@Injectable()
export class AppRouteReuseStrategy extends BaseRouteReuseStrategy {

  /**
   * Uses Angular's default reuse behavior, but recreates the match page when its match ID changes.
   *
   * @param future - Route being navigated to.
   * @param current - Currently active route.
   * @returns Whether the current component should be reused.
   */
  override shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    if (!super.shouldReuseRoute(future, current)) {
      return false;
    }

    if (future.routeConfig?.component === MatchPage) {
      return future.paramMap.get('matchId') === current.paramMap.get('matchId');
    }

    return true;
  }
}
