import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';
import {ALL_API_ERROR_CODES} from '../../../../data/api/errors/api-error-code';
import {isApiErrorResponse} from '../../../../data/api/errors/api-error-response';
import {MatchRepository} from '../../../../data/repository/match-repository';
import * as CreateMatchFormModel from '../../components/create-match-form/create-match-form.model';
import * as MatchIdFormModel from '../../components/match-id-form/match-id-form.model';
import {mapToCreateMatchRequest} from '../../mappers/create-match-request.mapper';
import {mapToCreateMatchSubmitErrors} from '../../mappers/create-match-submit-error.mapper';
import {mapToMatchIdSubmitErrors} from '../../mappers/match-id-submit-error.mapper';
import {HomePageState, INITIAL_HOME_STATE} from './home-page-state';

@Injectable()
export class HomePageStore {
  private readonly matchRepository = inject(MatchRepository);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<HomePageState>(INITIAL_HOME_STATE);
  readonly state = this._state.asReadonly();

  /**
   * Submits the create-match form.
   *
   * On success, stores the created match ID for navigation and resolves with no submission errors.
   * API failures are mapped to form submission errors.
   *
   * @param formModel - Submitted create-match form model.
   * @returns A promise resolving to form submission errors.
   */
  submitCreateMatch(formModel: CreateMatchFormModel.FormModel): Promise<CreateMatchFormModel.SubmitError[]> {
    return firstValueFrom(
      this.matchRepository
        .createMatch(mapToCreateMatchRequest(formModel), ALL_API_ERROR_CODES)
        .pipe(
          tap(match => {
            this.patchState({navigateToMatchId: match.id});
          }),
          map(() => []),
          catchError((error: unknown) => {
            const errorResponse = isApiErrorResponse(error) ? error : undefined;
            return of<CreateMatchFormModel.SubmitError[]>(mapToCreateMatchSubmitErrors(errorResponse));
          }),
          takeUntilDestroyed(this.destroyRef)
        ),
      {defaultValue: []}
    );
  }

  /**
   * Submits the match ID form.
   *
   * Validates that the submitted match ID belongs to an existing match.
   * On success, stores the match ID for navigation and resolves with no submission errors.
   * API failures are mapped to match ID form submission errors.
   *
   * @param formModel - Submitted match ID form model.
   * @returns A promise resolving to form submission errors.
   */
  submitMatchId(formModel: MatchIdFormModel.FormModel): Promise<MatchIdFormModel.SubmitError[]> {
    return firstValueFrom(
      this.matchRepository
        .matchExists(formModel.matchId, ALL_API_ERROR_CODES)
        .pipe(
          tap(() => {
            this.patchState({navigateToMatchId: formModel.matchId});
          }),
          map(() => []),
          catchError((error: unknown) => {
            const errorResponse = isApiErrorResponse(error) ? error : undefined;
            return of<MatchIdFormModel.SubmitError[]>(mapToMatchIdSubmitErrors(errorResponse));
          }),
          takeUntilDestroyed(this.destroyRef)
        ),
      {defaultValue: []}
    );
  }

  /**
   * Updates the current home state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<HomePageState>): void {
    this._state.update(state => ({
      ...state,
      ...patch,
    }));
  }
}
