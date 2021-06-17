import {User} from './user';

export enum FriendRequestTypeEnum {
  SENT, RECEIVED
}

export enum FriendRequestStatusEnum {
  ACCEPTED = 'ACCEPTED', DECLINED = 'DECLINED'
}

export interface FriendRequest {
  id: string;
  sender: User | string;
  receiver: User | string;
  date: Date;
  type?: FriendRequestTypeEnum;
}

export function checkFriendRequestAgainstUser(friendRequest: FriendRequest, userId: string): FriendRequestTypeEnum | null {
  if (userId === friendRequest.sender || userId === (friendRequest.sender as User).id) return FriendRequestTypeEnum.SENT;
  if (userId === friendRequest.receiver || userId === (friendRequest.receiver as User).id) return FriendRequestTypeEnum.RECEIVED;

  return null;
}
