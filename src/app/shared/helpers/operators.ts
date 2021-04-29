import {defer, Observable, Subject} from 'rxjs';
import {finalize} from 'rxjs/operators';

export const doOnSubscribe = (onSubscribe: () => void) =>
  <T>(source: Observable<T>) => defer(() => {
    onSubscribe();
    return source;
  });

export function withLoading<T>(indicator: Subject<boolean>): (source: Observable<T>) => Observable<T> {
  if (!indicator) {
    return (source: Observable<T>) => source;
  }

  return (source: Observable<T>): Observable<T> => source.pipe(
    doOnSubscribe(() => indicator.next(true)),
    finalize(() => indicator.next(false))
  );
}
