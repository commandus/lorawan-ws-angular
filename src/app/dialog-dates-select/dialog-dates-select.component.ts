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
  startfinish: StartFinish;

  constructor(
    private dialogRef: MatDialogRef<DialogDatesSelectComponent>,
    @Inject(MAT_DIALOG_DATA) data: {title: string, message: string, startfinish?: StartFinish }
  ) {
    this.title = data.title;
    this.message = data.message;

    if (typeof data.startfinish === 'undefined') {
      let d = new Date();
      d.setHours(0,0,0,0);
      const f = d.getTime() / 1000;
      const s = f - 86400;
      this.startfinish = new StartFinish(s, f);
    } else {
      this.startfinish = data.startfinish;
    }
  }

  onSelected(v: StartFinish) {
    if (v) {
      this.selected.emit(v);
      this.dialogRef.close({yes: true});
    }
  }
}
