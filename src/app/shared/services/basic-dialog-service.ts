import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BasicDialogComponent, BasicDialogData} from '../components/basic-dialog/basic-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class BasicDialogService {

  public constructor(private matDialog: MatDialog) {
  }

  public createResourceNotFoundErrorDialog(resourceType: string, stackable: boolean = false) {
    const dialogData: BasicDialogData = {
      title: `The ${resourceType} you are looking for could not be found`,
      content: 'Please try again or contact us.'
    };

    if (!stackable && !this.isDialogOpen()) {
      this.matDialog.open(BasicDialogComponent, {data: dialogData});
    } else if (stackable) {
      this.matDialog.open(BasicDialogComponent, {data: dialogData});
    }
  }

  public createWebsocketNoConnectionErrorDialog(reconnect: boolean, stackable: boolean = false): MatDialogRef<BasicDialogComponent> {
    const dialogData: BasicDialogData = {
      title: 'Couldn\'t make a live connection',
      content: 'Please try again or contact us.',
      ok: reconnect ? 'Reconnect' : null
    };

    if (!stackable && !this.isDialogOpen()) {
      return this.matDialog.open(BasicDialogComponent, {data: dialogData});
    } else if (stackable) {
      return this.matDialog.open(BasicDialogComponent, {data: dialogData});
    }
  }

  public createInternalErrorDialog(stackable: boolean = false) {
    const dialogData: BasicDialogData = {
      title: 'Oops, something went wrong',
      content: 'Please try again or contact us.'
    };

    if (!stackable && !this.isDialogOpen()) {
      this.matDialog.open(BasicDialogComponent, {data: dialogData});
    } else if (stackable) {
      this.matDialog.open(BasicDialogComponent, {data: dialogData});
    }
  }

  private isDialogOpen(): boolean {
    return !!this.matDialog.openDialogs?.length;
  }

}
