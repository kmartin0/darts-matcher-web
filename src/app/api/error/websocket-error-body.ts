import {ApiErrorBody, isApiErrorBody} from './api-error-body';

export interface WebsocketErrorBody extends ApiErrorBody{
  destination: string;
}

export function isWebsocketErrorBody(object): object is WebsocketErrorBody {
  const errorBody = object as WebsocketErrorBody;
  return isApiErrorBody(object) && errorBody.destination !== undefined;
}
