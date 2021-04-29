import {X01AverageStatistics} from './x01-average-statistics';
import {X01CheckoutStatistics} from './x01-checkout-statistics';
import {X01ScoresStatistics} from './x01-scores-statistics';

export interface X01PlayerStatistics {
  playerId: string;
  averageStats: X01AverageStatistics;
  checkoutStats: X01CheckoutStatistics;
  scoresStats: X01ScoresStatistics;
}
