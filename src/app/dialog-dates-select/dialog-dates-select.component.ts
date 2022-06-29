import { StartFinish } from './../model/startfinish';
import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-dates-select',
  templateUrl: './dialog-dates-select.component.html',
  styleUrls: ['./dialog-dates-select.component.css']
})
export class DialogDatesSelectComponent {
  @Output() selected = new EventEmitter<StartFinish>();
  title: string;
  message: string;
  value: StartFinish;

  constructor(
    private dialogRef: MatDialogRef<DialogDatesSelectComponent>,
    @Inject(MAT_DIALOG_DATA) data: {title: string, message: string, value?: StartFinish }
  ) {
    this.title = data.title;
    this.message = data.message;

    if (typeof data.value === 'undefined') {
      this.value = new StartFinish(Math.round(new Date().getTime() / 1000), Math.round(new Date().getTime() / 1000));
    } else {
      this.value = data.value;
    }
  }

  onSelected(v: StartFinish) {
    if (v) {
      this.selected.emit(v);
      this.dialogRef.close({yes: true});
    }
  }
}
