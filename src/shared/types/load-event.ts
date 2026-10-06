export type LoadEvent<T> =
  | {type: 'loading'}
  | {type: 'data'; data: T};
