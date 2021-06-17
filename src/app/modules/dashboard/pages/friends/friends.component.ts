import {Component, OnDestroy, ViewChild} from '@angular/core';
import {ApiService} from '../../../../shared/services/api.service';
import {UserService} from '../../../../shared/services/user.service';
import {IRxStompPublishParams, RxStomp, RxStompState} from '@stomp/rx-stomp';
import {map, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {FriendService} from '../../../../shared/services/friend.service';
import {User} from '../../../../shared/models/user';
import {
  checkFriendRequestAgainstUser,
  FriendRequest, FriendRequestStatusEnum, FriendRequestTypeEnum,
} from '../../../../shared/models/friend-request';
import {isWebsocketErrorBody, WebsocketErrorBody} from '../../../../api/error/websocket-error-body';
import {SearchUserFormComponent} from '../../../../shared/components/search-user-form/search-user-form.component';
import {
  CREATE_FRIEND_REQUEST_TOPIC,
  DELETE_FRIEND_TOPIC, ERROR_QUEUE, GET_FRIEND_REQUESTS_TOPIC_SUBSCRIPTION, GET_FRIENDS_TOPIC_SUBSCRIPTION,
  UPDATE_FRIEND_REQUEST_TOPIC
} from '../../../../api/web-socket-endpoints';

// TODO: Confirm delete / Revoke dialog.
// TODO: Animation when new friend (request)
// TODO: Mobile friendlier rows.
@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnDestroy {

  webSocket: RxStomp = null;

  errorQueueSubscription?: Subscription;
  friendsTopic$?: Observable<User[]>;
  friendRequestsTopic$?: Observable<FriendRequest[]>;

  loggedInUser: User;

  friendRequestTypeEnum = FriendRequestTypeEnum;
  friendRequestStatusEnum = FriendRequestStatusEnum;

  @ViewChild(SearchUserFormComponent) searchUserFormComponent!: SearchUserFormComponent;

  constructor(private apiService: ApiService, private userService: UserService, private matDialog: MatDialog, private friendService: FriendService) {
    this.initWebSocket();
  }

  handlePublishFriendRequestError(error: WebsocketErrorBody) {
    this.searchUserFormComponent.handleApiError(error);
  }

  initWebSocket() {
    this.webSocket = this.friendService.getFriendsWebSocket();

    this.webSocket.connectionState$.subscribe(connectionState => {
      if (connectionState === RxStompState.OPEN) {
        this.errorQueueSubscription?.unsubscribe();

        this.userService.getLoggedInUser().subscribe(user => {
          this.loggedInUser = user;
          this.subscribeTopics();
        });

      }
    });

    this.webSocket.activate();
  }

  ngOnDestroy() {
    if (this.webSocket) {
      this.webSocket.deactivate().then(() => {
        this.errorQueueSubscription?.unsubscribe();

        // TODO: Check if html template unsubscribes.
        this.errorQueueSubscription = null;
        this.friendsTopic$ = null;
        this.friendRequestsTopic$ = null;
      });
    }
  }

  publishCreateFriendRequest(user: User) {
    const friendRequest: FriendRequest = {
      date: undefined,
      id: undefined,
      receiver: user,
      sender: this.loggedInUser
    };

    const publishParams: IRxStompPublishParams = {
      body: JSON.stringify(friendRequest),
      destination: CREATE_FRIEND_REQUEST_TOPIC
    };

    this.webSocket.publish(publishParams);

    this.searchUserFormComponent.resetForm();
  }

  publishDeleteFriend(user: User) {
    const publishParams: IRxStompPublishParams = {
      body: JSON.stringify(user.id),
      destination: DELETE_FRIEND_TOPIC
    };

    this.webSocket.publish(publishParams);
  }

  publishUpdateFriendRequest(friendRequest: FriendRequest, friendRequestStatus: FriendRequestStatusEnum) {
    const publishParams: IRxStompPublishParams = {
      body: JSON.stringify(friendRequestStatus),
      destination: UPDATE_FRIEND_REQUEST_TOPIC(friendRequest.id)
    };

    this.webSocket.publish(publishParams);
  }

  private subscribeTopics() {
    this.errorQueueSubscription = this.webSocket.watch(ERROR_QUEUE).pipe(
      map(value => JSON.parse(value.body))
    ).subscribe(webSocketError => {
      if (isWebsocketErrorBody(webSocketError)) {
        if (webSocketError.destination === CREATE_FRIEND_REQUEST_TOPIC) {
          this.handlePublishFriendRequestError(webSocketError);
        }
      }
    }, error => {
      console.log(error);
    });

    // TODO: Check if template still receives input after being called a second time. e.g. connection state is closed and then re-opened.
    this.friendsTopic$ = this.webSocket.watch(GET_FRIENDS_TOPIC_SUBSCRIPTION).pipe(
      map(value => JSON.parse(value.body)),
      tap(x => console.log(x))
    );

    this.friendRequestsTopic$ = this.webSocket.watch(GET_FRIEND_REQUESTS_TOPIC_SUBSCRIPTION).pipe(
      map(value => JSON.parse(value.body)),
      map((friendRequests: FriendRequest[]) => { // Set sent or received type.
        return friendRequests.map(friendRequest => {
          friendRequest.type = checkFriendRequestAgainstUser(friendRequest, this.loggedInUser.id);
          return friendRequest;
        });
      }),
      tap(x => console.log(x))
    );
  }

}
