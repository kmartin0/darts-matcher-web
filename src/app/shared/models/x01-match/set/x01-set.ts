import {X01Leg} from '../leg/x01-leg';
import {X01PlayerResult} from '../player-result/x01-player-result';
import {X01SetPlayerResult} from './x01-set-player-result';

export interface X01Set {
  set: number;
  result: X01SetPlayerResult[];
  legs: X01Leg[];
}

export function getLeg(set: X01Set, legNumber: number): X01Leg {
  if (!set || !set.legs || !set.legs.length) return null;

  return set.legs.find(x01Leg => x01Leg.leg === legNumber);
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
