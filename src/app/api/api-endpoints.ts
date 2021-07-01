import {environment} from '../../environments/environment';

export const BASE_URL = environment.dartsMatcherApiUrl;

// Auth endpoints
export const LOGIN = `${BASE_URL}/oauth/token`;

// User endpoints
export const SAVE_USER = `${BASE_URL}/users`;
export const GET_AUTHENTICATED_USER = `${BASE_URL}/users`;
export const GET_USER_BY_ID = (id: string) => `${BASE_URL}/users/${id}`;
export const SEARCH_USERS = (query: string) => `${BASE_URL}/users:search?query=${encodeURI(query)}`;

// Matches endpoints
export const CREATE_MATCH = `${BASE_URL}/matches`;
export const UPDATE_MATCH = (id: string) => `${BASE_URL}/matches/${id}`;
export const GET_MATCH = (id: string) => `${BASE_URL}/matches/${id}`;
export const GET_CHECKOUTS = `${BASE_URL}/checkouts`;
