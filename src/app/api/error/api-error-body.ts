import {ApiErrorEnum} from './api-error.enum';

export interface TargetErrors {
  [target: string]: string;
}

export interface ApiErrorBody {
  error: ApiErrorEnum;
  description?: string;
  error_description?: string;
  code: number;
  details?: TargetErrors; // array of details for targets containing the target and the error.
}

export function isApiErrorBody(object): object is ApiErrorBody {
  const apiErrorBody = object as ApiErrorBody;
  return apiErrorBody.error !== undefined && (apiErrorBody.description || apiErrorBody.error_description) !== undefined;
}
