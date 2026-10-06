import {MatchHistoryEntry} from './match-history-entry';
import {PageMetadata} from '../../../shared/types/page-metadata';

export interface MatchHistoryPage {
  entries: MatchHistoryEntry[];
  pageMetaData: PageMetadata;
}
