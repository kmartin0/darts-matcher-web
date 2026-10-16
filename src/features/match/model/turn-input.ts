export interface TurnInput {
  score: number;
  checkoutDartsUsed: number | null;
  checkoutDoublesMissed: number | null;
  openingDoublesMissed: number | null;
}

export type CreateTurnInput = TurnInput;

export interface EditTurnInput extends TurnInput {
  playerId: string;
  setNumber: number;
  legNumber: number;
  roundNumber: number;
}
