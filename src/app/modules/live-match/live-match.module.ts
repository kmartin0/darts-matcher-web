import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import { LiveMatchComponent } from './pages/live-match/live-match.component';
import {LiveMatchRoutingModule} from './live-match-routing.module';
import { X01MatchSheetComponent } from './components/x01-match-sheet/x01-match-sheet.component';
import {BidiModule} from '@angular/cdk/bidi';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {A11yModule} from '@angular/cdk/a11y';
import {ReactiveFormsModule} from '@angular/forms';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
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



@NgModule({
  declarations: [LiveMatchComponent, X01MatchSheetComponent, KeyboardComponent],
  imports: [
    CommonModule,
    SharedModule,
    LiveMatchRoutingModule,
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
    MatTooltipModule
  ]
})
export class LiveMatchModule { }
