import {Component, Input} from '@angular/core';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';

@Component({
  selector: 'app-x01-match-recap',
  templateUrl: './x01-match-recap.component.html',
  styleUrls: ['./x01-match-recap.component.scss']
})
export class X01MatchRecapComponent {

  @Input() x01Match: X01Match;

}
