export interface X01CreateTurnRequestDto {
  score: number;
  checkoutDoublesMissed: number | null;
  openingDoublesMissed: number | null;
  checkoutDartsUsed: number | null;
  matchVersion: number | null;
}
