import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {X01MatchSettings} from '../../../data/model/x01/match/x01-match-settings';
import {X01BestOfType} from '../../../data/model/x01/rules/x01-best-of-type';
import {X01ClearByTwoRule} from '../../../data/model/x01/rules/x01-clear-by-two-rule';
import {MatTooltip} from '@angular/material/tooltip';

interface MatchRuleRow {
  readonly label: string;
  readonly value: string;
}

/**
 * Displays the applicable match rules in a popup opened from an information button.
 */
@Component({
  selector: 'app-match-rules-menu',
  imports: [
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatTooltip
  ],
  templateUrl: './match-rules-menu.html',
  styleUrl: './match-rules-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchRulesMenu {
  readonly matchSettings = input.required<X01MatchSettings>();

  protected readonly rules = computed<readonly MatchRuleRow[]>(() =>
    this.resolveRules(this.matchSettings())
  );

  /**
   * Resolves the applicable display rows for the supplied match settings.
   *
   * @param settings - Match settings to display.
   * @returns Applicable rule rows in display order.
   */
  private resolveRules(settings: X01MatchSettings): readonly MatchRuleRow[] {
    const bestOf = settings.bestOf;
    const isBestOfSets = bestOf.bestOfType === X01BestOfType.SETS;
    const rules: MatchRuleRow[] = [];

    const add = (label: string, value: string, applicable = true): void => {
      if (applicable) {
        rules.push({label, value});
      }
    };

    add('X01', String(settings.x01));
    add('Format', settings.format);
    add('Goal', `Best of - ${isBestOfSets ? 'Sets' : 'Legs'}`);
    add('Sets', `BO${bestOf.sets}`, isBestOfSets);
    add('Legs', `BO${bestOf.legs}`);
    add('Clear by two sets', this.formatClearByTwoRule(bestOf.clearByTwoSetsRule), isBestOfSets);
    add('Clear by two legs', this.formatClearByTwoRule(bestOf.clearByTwoLegsRule));
    add('Clear by two legs in final set', this.formatClearByTwoRule(bestOf.clearByTwoLegsInFinalSetRule), isBestOfSets);
    add('Track doubles', settings.trackDoubles ? 'Yes' : 'No');

    return rules;
  }

  /**
   * Formats whether a clear-by-two rule is enabled and its configured limit.
   *
   * @param rule - Clear-by-two rule to format.
   * @returns Formatted rule summary.
   */
  private formatClearByTwoRule(rule: X01ClearByTwoRule): string {
    return rule.enabled ? `Yes - Limit ${rule.limit}` : 'No';
  }
}
