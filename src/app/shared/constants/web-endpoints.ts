export const PAGE_NOT_FOUND = '**';
export const HOME = '';
export const HOME_CREATE_MATCH = HOME + '/create-match';
export const DASHBOARD = '/dashboard';
export const UNAUTHENTICATED = '/unauthenticated';
export const DASHBOARD_CREATE_MATCH = DASHBOARD + '/create-match';
export const FRIENDS = DASHBOARD + '/friends';
export const LIVE_MATCH = id => `/live-match/${id}`;
export const RECAP_MATCH = id => LIVE_MATCH(id) + '/recap';
