import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {LiveMatchComponent} from './components/live-match/live-match.component';
import {MatchRoutingModule} from './match-routing.module';
import {X01MatchSheetComponent} from './components/x01-match-sheet/x01-match-sheet.component';
import {BidiModule} from '@angular/cdk/bidi';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {A11yModule} from '@angular/cdk/a11y';
import {ReactiveFormsModule} from '@angular/forms';
import {ScoreInputComponent} from './components/score-input/score-input.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatTableModule} from '@angular/material/table';
import {MatBadgeModule} from '@angular/material/badge';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {X01MatchRecapComponent} from './components/x01-match-recap/x01-match-recap.component';
import {MatSliderModule} from '@angular/material/slider';
import {X01StatisticsComponent} from './components/x01-statistics/x01-statistics.component';
import {X01SummaryComponent} from './components/x01-summary/x01-summary.component';
import {X01MatchInformationComponent} from './components/x01-match-information/x01-match-information.component';
import {LobbyComponent} from './components/lobby/lobby.component';
import {MatchComponent} from './pages/match/match.component';


@NgModule({
  declarations: [
    LiveMatchComponent,
    X01MatchSheetComponent,
    ScoreInputComponent,
    X01MatchRecapComponent,
    X01StatisticsComponent,
    X01SummaryComponent,
    X01MatchInformationComponent,
    LobbyComponent,
    MatchComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatchRoutingModule,
    BidiModule,
    MatIconModule,
    MatInputModule,
    A11yModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatBadgeModule,
    MatExpansionModule,
    MatTabsModule,
    CdkScrollableModule,
    MatSelectModule,
    MatDialogModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSliderModule,
  ]
})
export class MatchModule {
}
