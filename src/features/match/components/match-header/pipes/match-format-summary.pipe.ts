import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/match/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

export interface MatchFormatSummaryPipeData {
  matchSettings: X01MatchSettings;
  matchType: X01Match['matchType'];
}

/**
 * Formats the best-of configuration displayed in the match header.
 */
@Pipe({
  name: 'matchFormatSummary'
})
export class MatchFormatSummaryPipe implements PipeTransform {

  /**
   * Formats the configured number of sets and legs.
   *
   * Examples:
   * `Best of 5 legs`
   * `Best of 3 sets (BO5)`
   *
   * @param data - Match data containing the best-of configuration.
   * @returns Formatted best-of description.
   */
  transform(data: MatchFormatSummaryPipeData): string {
    const bestOf = data.matchSettings.bestOf;

    switch (bestOf.bestOfType) {
      case X01BestOfType.SETS:
        return `Best of ${formatCount(bestOf.sets, 'set', 'sets')} (BO${bestOf.legs})`;

      case X01BestOfType.LEGS:
        return `Best of ${formatCount(bestOf.legs, 'leg', 'legs')}`;
    }
  }
}
