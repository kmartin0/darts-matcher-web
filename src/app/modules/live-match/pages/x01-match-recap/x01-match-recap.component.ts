import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {X01MatchRecapUiData} from './x01-match-recap-ui-data';

@Component({
  selector: 'app-x01-match-recap',
  templateUrl: './x01-match-recap.component.html',
  styleUrls: ['./x01-match-recap.component.scss']
})
export class X01MatchRecapComponent implements OnInit, OnChanges {

  @Input() x01Match: X01Match;
  recapUiData: X01MatchRecapUiData;

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
