import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ResultType} from '../../../../shared/models/match/result-type';
import {X01Match} from '../../../../shared/models/x01-match/x01-match';
import {Observable} from 'rxjs';
import {ThemeService} from '../../../../shared/services/theme/theme-service';
import {X01SummaryUiData} from './x01-summary-ui-data';

@Component({
  selector: 'app-x01-summary',
  templateUrl: './x01-summary.component.html',
  styleUrls: ['./x01-summary.component.scss']
})
export class X01SummaryComponent implements OnChanges {

  @Input() x01Match: X01Match;

  isDarkMode$: Observable<boolean> = this.themeService.isDarkTheme;
  resultType = ResultType;
  summaryUiData: X01SummaryUiData;

  constructor(private changeDetectorRef: ChangeDetectorRef, private themeService: ThemeService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.x01Match && changes.x01Match?.currentValue) {
      this.summaryUiData = new X01SummaryUiData(this.x01Match);
      this.changeDetectorRef.detectChanges();
    }
  }

}
