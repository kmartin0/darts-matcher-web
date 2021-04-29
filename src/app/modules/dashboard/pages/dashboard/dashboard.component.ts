import {Component, OnDestroy, OnInit} from '@angular/core';
import {DASHBOARD_CREATE_MATCH, MATCH_HISTORY} from '../../../../shared/constants/web-endpoints';
import {UserService} from '../../../../shared/services/user.service';
import {Subject} from 'rxjs';
import {ActivatedRoute, ChildActivationEnd, Router} from '@angular/router';
import {filter, map, takeUntil} from 'rxjs/operators';
import {getActivatedRouteTitle} from '../../../../shared/helpers/routing.helper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  navRoutes = {
    createMatch: DASHBOARD_CREATE_MATCH,
    matchHistory: MATCH_HISTORY
  };

  title = 'Live Match';

  private unsubscribe$ = new Subject();

  constructor(private userService: UserService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.initTitleChangeObserver();
  }

  onLogout() {
    this.userService.logoutUser();
  }

  private initTitleChangeObserver() {
    this.title = getActivatedRouteTitle(this.activatedRoute.snapshot);

    this.router.events
      .pipe(
        filter(e => e instanceof ChildActivationEnd && e.snapshot.component === DashboardComponent),
        map(ev => {
          return getActivatedRouteTitle((ev as ChildActivationEnd).snapshot)
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(title => {
        this.title = title;
      });
  }

}
