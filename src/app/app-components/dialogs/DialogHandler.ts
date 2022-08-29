import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ErrorDialogData } from './error-dialog/error-dialog-data';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogData } from './confirm-dialog/confirm-dialog-data';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogHandler {

  constructor(
    private dialog: MatDialog
  ) { }

  confirm(data: ConfirmDialogData): Observable<string> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: data
      })
      .afterClosed() as Observable<string>;
  }

  error(data: ErrorDialogData): void {
    this.dialog
      .open(ErrorDialogComponent, {
        data: data
      });
  }

}
