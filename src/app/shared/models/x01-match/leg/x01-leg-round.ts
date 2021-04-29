import {X01LegRoundScore} from './x01-leg-round-score';

export interface X01LegRound {
  round: number;
  playerScores: X01LegRoundScore[];
}
