import {environment} from '../../environments/environment';

export const BASE_URL_WEBSOCKET = environment.dartsMatcherWebsocketUrl;
export const GET_DARTS_MATCHER_WEBSOCKET = `${BASE_URL_WEBSOCKET}/darts-matcher-websocket/websocket`;

// Error Queue
export const ERROR_QUEUE = `/user/queue/errors`;

// Live Match Topics
export const X01_START_MATCH_TOPIC = (matchId: string) => `/app/topic/matches/${matchId}:start`;
export const X01_ADD_THROW_TOPIC = (matchId: string) => `/app/topic/matches/${matchId}:add-throw`;
export const X01_DELETE_THROW_TOPIC = (matchId: string) => `/app/topic/matches/${matchId}:delete-throw`;
export const X01_DELETE_LEG_TOPIC = (matchId: string) => `/app/topic/matches/${matchId}:delete-leg`;
export const X01_DELETE_SET_TOPIC = (matchId: string) => `/app/topic/matches/${matchId}:delete-set`;
export const X01_THROW_DART_BOT_TOPIC = (matchId: string) => `/app/topic/matches/${matchId}:throw-dart-bot`;

export const X01_MATCH_TOPIC_REQUEST_REPLY = (matchId: string) => `/app/topic/matches/${matchId}`;
export const X01_MATCH_TOPIC_SUBSCRIPTION = (matchId: string) => `/topic/matches/${matchId}`;


// Friend Requests Topics
export const GET_FRIEND_REQUESTS_TOPIC_SUBSCRIPTION = `/user/topic/friends/requests`;
export const CREATE_FRIEND_REQUEST_TOPIC = `/app/topic/friends/requests:create`;
export const UPDATE_FRIEND_REQUEST_TOPIC = (friendRequestId: string) => `/app/topic/friends/requests/${friendRequestId}:update`;

// Friends Topics
export const GET_FRIENDS_TOPIC_SUBSCRIPTION = `/user/topic/friends`;
export const DELETE_FRIEND_TOPIC = `/app/topic/friends:delete`;







