import {X01EditTurnRequestDto} from '../../../data/dto/x01-edit-turn-request.dto';
import {EditTurnInput} from '../model/turn-input';

export function mapToEditTurnRequestDto(input: EditTurnInput): X01EditTurnRequestDto {
  return {
    playerId: input.playerId,
    set: input.setNumber,
    leg: input.legNumber,
    round: input.roundNumber,
    score: input.score,
    matchVersion: input.matchVersion,
    checkoutDoublesMissed: input.checkoutDoublesMissed,
    openingDoublesMissed: input.openingDoublesMissed,
    checkoutDartsUsed: input.checkoutDartsUsed
  };
}
