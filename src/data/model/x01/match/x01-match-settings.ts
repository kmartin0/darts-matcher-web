import {X01BestOf} from '../rules/x01-best-of';
import {X01MatchFormat} from './x01-match-format';

export interface X01MatchSettings {
  x01: number;
  trackDoubles: boolean;
  bestOf: X01BestOf;
  format: X01MatchFormat;
}
