import {Component, input, output} from '@angular/core';
import {MatCard, MatCardActions} from '@angular/material/card';
import {MatchHistoryCardData} from './match-history-card-data';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {MatchStatus} from '../../../../data/model/base-match/match-status';
import {ResultType} from '../../../../data/model/base-match/result-type';
import {DatePipe} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {EpochSecondsToDatePipe} from '../../../../shared/pipes/epoch-seconds-to-date.pipe';

@Component({
  selector: 'app-match-history-card',
  imports: [MatCard, DatePipe, MatCardActions, MatIconButton, MatIcon, RouterLink, MatTooltip, EpochSecondsToDatePipe, MatButton],
  templateUrl: './match-history-card.html',
  styleUrl: './match-history-card.scss'
})
export class MatchHistoryCard {
  readonly matchHistoryCardData = input.required<MatchHistoryCardData>();

  readonly deleteMatchFromHistory = output<string>();

  protected readonly X01BestOfType = X01BestOfType;
  protected readonly MatchStatus = MatchStatus;
  protected readonly ResultType = ResultType;
  protected readonly AppEndpoints = AppEndpoints;
}
