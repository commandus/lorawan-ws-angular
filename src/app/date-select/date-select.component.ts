import { StartFinish } from './../model/startfinish';
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.css']
})
export class DateSelectComponent implements OnInit {
  @Output() selected = new EventEmitter<StartFinish>();
  @Input() start: number;
  @Input() finish: number;

  startDate: FormControl;
  finishDate: FormControl;

  constructor(
  ) {
  }

  ngOnInit() {
    this.startDate = new FormControl(typeof this.start === 'undefined' ? new Date() : new Date(this.start * 1000));
    this.finishDate = new FormControl(typeof this.finish === 'undefined' ? new Date() : new Date(this.finish * 1000));
    }

  select(): void {
    this.startDate.value.setHours(0, 0, 0, 0);
    let start = Math.round(this.startDate.value.getTime() / 1000);
    this.finishDate.value.setHours(0, 0, 0, 0);
    let finish = Math.round(this.finishDate.value.getTime() / 1000);
    let r: StartFinish;
    if (finish < start) {
      // swap
      const t = start;
      start = finish;
      finish = t;
    }
    finish += 86400; // day inclusive
    r = new StartFinish(start, finish);
    this.selected.emit(r);
  }
}
