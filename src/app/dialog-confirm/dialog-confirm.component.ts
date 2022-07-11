import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.css']
})
export class DialogConfirmComponent implements OnInit {
  title: string;
  message: string;

  constructor(
    private dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) data : { title: string, message: string }
  ) {
    this.title = data.title;
    this.message = data.message;
  }

  ngOnInit() {
  }

  ok() {
    this.dialogRef.close({yes: true});
  }

  cancel() {
    this.dialogRef.close({yes: false});
}

}
