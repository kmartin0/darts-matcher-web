import {concatMap, delay, MonoTypeOperatorFunction, of} from 'rxjs';
import {StreamEventType} from '../../../data/api/ws/stream-event-type';
import {MatchMessageUnion} from '../../../data/api/ws/match-message';
import {MatchMessageType} from '../../../data/api/ws/match-message-type';

const BOT_TURN_DELAY_MS = 500;

/**
 * Delays bot turn events while preserving stream event order.
 *
 * @returns Operator that delays only bot turn data events.
 */
export function delayBotTurns(): MonoTypeOperatorFunction<StreamEventType<MatchMessageUnion>> {
  return concatMap(event =>
    event.type === 'data' && event.data.messageType === MatchMessageType.ADD_BOT_TURN
      ? of(event).pipe(delay(BOT_TURN_DELAY_MS))
      : of(event)
  );
}
