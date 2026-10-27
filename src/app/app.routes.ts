import {Routes} from '@angular/router';
import {HomePage} from '../features/home/pages/home-page/home-page';
import {MatchPage} from '../features/match/pages/match-page/match-page';
import {PageError} from '../shared/components/page-error/page-error';
import {MatchHistoryPage} from '../features/match-history/pages/match-history-page/match-history-page';
import {LegalPage} from '../features/legal/pages/legal-page';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'matches/:matchId', component: MatchPage},
  {path: 'match-history', component: MatchHistoryPage},
  {path: 'legal', component: LegalPage},
  {path: '**', component: PageError, data: {message: '404 Page Not Found', showHomeButton: true}}
];
