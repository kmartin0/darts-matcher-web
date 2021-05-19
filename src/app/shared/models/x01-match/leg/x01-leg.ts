import {X01LegRound} from './x01-leg-round';

export interface X01Leg {
  leg: number;
  winner: string;
  throwsFirst: string;
  rounds: X01LegRound[];
}

export function getRound(leg: X01Leg, roundNumber: number): X01LegRound {
  if (!leg || !leg.rounds || !leg.rounds.length) return null;

  return leg.rounds.find(x01Round => x01Round.round === roundNumber);
}

export function getRoundInPlay(leg: X01Leg, currentThrower: string): X01LegRound {
  if (!leg || !leg.rounds || !leg.rounds.length || !currentThrower) return null;

  // If the leg is concluded, return the last round.
  if (leg.winner !== null) {
    return leg.rounds.reduce((previousValue, currentValue) => currentValue.round > previousValue.round ? currentValue : previousValue);
  }

  // Find all rounds the currentThrower hasn't thrown in.
  const unfinishedRounds = leg.rounds.filter(legRound => !legRound.playerScores.find(roundScore => roundScore.playerId === currentThrower));

  // Return the first unfinished round.
  return unfinishedRounds.reduce((previousValue, currentValue) => (currentValue.round < previousValue.round) ? currentValue : previousValue);
}
