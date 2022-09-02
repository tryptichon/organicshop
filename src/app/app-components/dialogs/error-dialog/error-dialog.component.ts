import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorDialogData } from './error-dialog-data';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.sass']
})
export class ErrorDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData,
  ) {
    this.data = {
      title: data.title,
      message: (typeof data.message === 'string') || ('toString' in data.message) ? data.message : JSON.stringify(data.message)
    }
  }

  onClick(): void {
    this.dialogRef.close();
  }
}
