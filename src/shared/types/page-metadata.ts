export interface PageMetadata {
  index: number; // Zero-based page index
  size: number; // Maximum number of items per page
  totalItems: number; // Total number of items across all pages
}
