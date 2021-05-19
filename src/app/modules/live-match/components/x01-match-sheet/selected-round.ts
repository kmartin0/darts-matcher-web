import {X01Set} from '../../../../shared/models/x01-match/set/x01-set';
import {X01Leg} from '../../../../shared/models/x01-match/leg/x01-leg';
import {X01LegRound} from '../../../../shared/models/x01-match/leg/x01-leg-round';

export class SelectedRound {
  set: X01Set;
  leg: X01Leg;
  round: X01LegRound;
  setInPlay: X01Set;
  legInPlay: X01Leg;

  constructor(set: X01Set, leg: X01Leg, round: X01LegRound, setInPlay: X01Set, legInPlay: X01Leg) {
    this.set = set;
    this.leg = leg;
    this.round = round;
    this.setInPlay = setInPlay;
    this.legInPlay = legInPlay;
  }

  isLegInPlaySelected(): boolean {
    return this.set?.set === this.setInPlay?.set && this.leg?.leg === this.legInPlay?.leg;
  }
}
