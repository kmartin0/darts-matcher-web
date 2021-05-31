import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {X01StatisticsUiData} from '../x01-statistics/x01-statistics-ui-data';
import {ResultType} from '../../../../shared/models/match/result-type';

@Component({
  selector: 'app-x01-match-recap',
  templateUrl: './x01-match-recap.component.html',
  styleUrls: ['./x01-match-recap.component.scss']
})
export class X01MatchRecapComponent {

  @Input() x01Match: X01Match;
  // recapUiData: X01StatisticsUiData;
  // resultType = ResultType;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.x01Match && changes.x01Match?.currentValue) {
  //     this.recapUiData = new X01StatisticsUiData(this.x01Match);
  //     this.changeDetectorRef.detectChanges();
  //   }
  // }

}
