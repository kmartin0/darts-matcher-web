import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {X01MatchInformationUiData} from './x01-match-information-ui-data';

@Component({
  selector: 'app-x01-match-information',
  templateUrl: './x01-match-information.component.html',
  styleUrls: ['./x01-match-information.component.scss']
})
export class X01MatchInformationComponent implements OnChanges {

  @Input() x01Match: X01Match;
  matchInformationUiData: X01MatchInformationUiData;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.x01Match && changes.x01Match?.currentValue) {
      this.matchInformationUiData = new X01MatchInformationUiData(this.x01Match);
      this.changeDetectorRef.detectChanges();
    }
  }

}
