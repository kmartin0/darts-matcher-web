import {Component, computed, input, output} from '@angular/core';
import {MatchHistoryCard} from '../match-history-card/match-history-card';
import {MatchHistoryCardData} from '../match-history-card/match-history-card-data';
import {resolveMatchHistoryCards} from './match-history-cards.resolver';
import {MatchHistoryEntry} from '../../model/match-history-entry';

@Component({
  selector: 'app-match-history-cards',
  imports: [MatchHistoryCard],
  templateUrl: './match-history-cards.html',
  styleUrl: './match-history-cards.scss'
})
export class MatchHistoryCards {
  readonly matchHistoryEntries = input.required<MatchHistoryEntry[]>();

  readonly deleteMatchFromHistory = output<string>();

  protected readonly matchHistoryCardsData = computed<MatchHistoryCardData[]>(() =>
    resolveMatchHistoryCards(this.matchHistoryEntries())
  );
}
