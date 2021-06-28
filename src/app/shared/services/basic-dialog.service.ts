import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BasicDialogComponent, BasicDialogData} from '../components/basic-dialog/basic-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class BasicDialogService {

  public constructor(private matDialog: MatDialog) {
  }

  public createBasicDialog(dialogData: BasicDialogData, stackable: boolean = false): MatDialogRef<BasicDialogComponent> {
    if (!stackable && !this.isDialogOpen()) {
      return this.matDialog.open(BasicDialogComponent, {data: dialogData});
    } else if (stackable) {
      return this.matDialog.open(BasicDialogComponent, {data: dialogData});
    }
  }

  public createErrorDialog(dialogTitle: string, dialogContent: string, stackable: boolean = false) {
    const dialogData: BasicDialogData = {
      title: dialogTitle,
      content: dialogContent,
      matIcon: 'error'
    };

    this.createBasicDialog(dialogData, stackable);
  }

  public createResourceNotFoundErrorDialog(resourceType: string, stackable: boolean = false) {
    this.createErrorDialog(
      `The ${resourceType} you are looking for could not be found`,
      'Please try again or contact us.',
      stackable
    );
  }

  public createWebsocketNoConnectionErrorDialog(reconnect: boolean, stackable: boolean = false) {
    this.createErrorDialog(
      'Couldn\'t make a live connection',
      'Please try again or contact us.',
      stackable
    );
  }

  public createInternalErrorDialog(stackable: boolean = false) {
    this.createErrorDialog(
      'Oops, something went wrong',
      'Please try again or contact us.',
      stackable
    );
  }

  public createUriNotFoundErrorDialog(stackable: boolean = false) {
    this.createErrorDialog(
      'The uri you are trying to reach could not be found',
      'Please try again or contact us.',
      stackable
    );
  }

  public createUnavailableErrorDialog(stackable: boolean = false) {
    this.createErrorDialog(
      'The uri you are trying to reach could not be found',
      'Please try again or contact us.',
      stackable
    );
  }

  private isDialogOpen(): boolean {
    return !!this.matDialog.openDialogs?.length;
  }

}
