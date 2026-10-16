import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {X01StandingsEntry} from '../../../../data/model/x01/standings/x01-standings-entry';
import {X01MatchFormat} from '../../../../data/model/x01/match/x01-match-format';

/**
 * Data required to render a single leg in the match timeline.
 */
export interface MatchTimelineLegCardData {
  setNumber: number;
  legNumber: number;

  bestOfType: X01BestOfType;
  trackDoubles: boolean;

  throwsFirst: string;
  winner: string | null;
  checkoutScore: number | null;

  players: MatchTimelineLegCardPlayerData[];
  format: X01MatchFormat;
}

/**
 * Player identity, standing through the displayed leg, and leg-scoped statistics.
 *
 * Leg wins are scoped to the set containing that leg.
 */
export interface MatchTimelineLegCardPlayerData {
  playerId: string;
  playerTag: string;
  standing: X01StandingsEntry;

  dartsUsed: number;
  average: number | null;
  remaining: number;
  checkoutDoublesMissed: number;

  hasOpened: boolean;
  openingDoublesMissed: number;
}
