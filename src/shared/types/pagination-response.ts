import {PaginationRequest} from './pagination-request';

export interface PaginationResponse<T> extends PaginationRequest {
  items: T[];
  totalElements: number; // Total items across all pages
}
