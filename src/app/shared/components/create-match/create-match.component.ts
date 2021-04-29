import {Component, OnDestroy, ViewChild} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {MatchService} from '../../services/match.service';
import {X01Match} from '../../models/x01-match/x01-match';
import {UserService} from '../../services/user.service';
import {withLoading} from '../../helpers/operators';
import {Router} from '@angular/router';
import {LIVE_MATCH} from '../../constants/web-endpoints';
import {CreateMatchFormComponent} from '../create-match-form/create-match-form.component';

@Component({
  selector: 'app-create-match',
  templateUrl: './create-match.component.html',
  styleUrls: ['./create-match.component.scss']
})
export class CreateMatchComponent implements OnDestroy {

  loading$ = new BehaviorSubject<boolean>(false);
  unsubscribe$ = new Subject();

  @ViewChild(CreateMatchFormComponent, {static: false}) private _createMatchFormComponent: CreateMatchFormComponent;
  get createMatchFormComponent(): CreateMatchFormComponent {
    return this._createMatchFormComponent;
  }

  constructor(private matchService: MatchService, private userService: UserService, private router: Router) {
  }

  createMatch(match: X01Match) {
    this.matchService.createMatch(match)
      .pipe(withLoading(this.loading$))
      .subscribe(value => {
        // noinspection JSIgnoredPromiseFromCall
        this.router.navigate([LIVE_MATCH(value.id)]);
        console.log(value);
      }, error => {
        console.log(error);
        this.createMatchFormComponent.handleApiError(error);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
