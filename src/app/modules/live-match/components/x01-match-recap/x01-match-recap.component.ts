import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {X01MatchRecapUiData} from './x01-match-recap-ui-data';
import {ResultType} from '../../../../shared/models/match/result-type';

@Component({
  selector: 'app-x01-match-recap',
  templateUrl: './x01-match-recap.component.html',
  styleUrls: ['./x01-match-recap.component.scss']
})
export class X01MatchRecapComponent implements OnInit, OnChanges {

  @Input() x01Match: X01Match;
  recapUiData: X01MatchRecapUiData;
  resultType = ResultType;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.x01Match && changes.x01Match?.currentValue) {
      this.recapUiData = new X01MatchRecapUiData(this.x01Match);
      this.changeDetectorRef.detectChanges();
    }
  }

}
