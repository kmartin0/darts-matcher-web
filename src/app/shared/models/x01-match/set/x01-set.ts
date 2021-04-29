import {X01Leg} from '../leg/x01-leg';
import {X01PlayerResult} from '../player-result/x01-player-result';

export interface X01Set {
  set: number;
  result: X01PlayerResult[];
  legs: X01Leg[];
}

export function getLegInPlay(set: X01Set): X01Leg {
  if (!set || !set.legs || !set.legs.length) return null;

  // If the set is concluded, return the last leg.
  if (set.result.find(playerResult => playerResult.result != null)) {
    return set.legs.reduce((previousValue, currentValue) => currentValue.leg > previousValue.leg ? currentValue : previousValue);
  }

  // Get the legs that are still in-play.
  const legsWithoutResult = set.legs.filter(leg => !leg.winner);

  // Return the first leg that is in-play.
  return legsWithoutResult.reduce((previousValue, currentValue) => (currentValue.leg < previousValue.leg) ? currentValue : previousValue);

}
