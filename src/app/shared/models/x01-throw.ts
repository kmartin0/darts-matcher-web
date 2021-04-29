export interface X01Throw {
  matchId: string;
  playerId: string;
  leg: number;
  set: number;
  round: number;
  score: number;
  dartsUsed?: number;
  doublesMissed?: number;
}
