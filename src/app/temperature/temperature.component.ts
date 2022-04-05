import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { RawRecord } from '../model/rawrecord';

import { EnvAppService } from '../env-app.service';
import { TemperatureService } from '../service/temperature.service';
import { TemperatureDataSource } from '../service/temperature.ds';

// import { DialogOrderComponent } from '../dialog-order/dialog-order.component';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('startDate') filterStartDate: ElementRef;
  @ViewChild('finishDate') filterFinishDate: ElementRef;
  @ViewChild('filterDevName') filterDevName: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public values: TemperatureDataSource;
  
  public displayedColumns: string[] = [
    'id', 'kosa-year', 'no', 'measured', 'parsed', 'vcc', 'vbat', 't', 'raw', 'devname', 'loraaddr', 'received'
  ];

  startDate = new Date(0);
  finishDate = new Date();
  filterRawType = '';

  constructor(
    private router: Router,
    private env: EnvAppService,
    private temperatureService: TemperatureService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.values = new TemperatureDataSource(this.temperatureService);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        startWith(null),
        delay(0),
        tap(() => {
          this.load();
        })
        )
      .subscribe();

    fromEvent(this.filterDevName.nativeElement, 'keyup')
    .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
            this.load();
        })
    )
    .subscribe();
    this.sort.sortChange
    .pipe(
      tap(() => {
        this.load();
      })
    )
    .subscribe();
  }

  load() {
    const ofs = this.paginator.pageIndex * this.paginator.pageSize;
    let startDate = 0;
    let finishDate = Math.round(new Date().getTime() / 1000);
    
    if (this.startDate) {
      this.startDate.setHours(0, 0, 0, 0);
      startDate = Math.round(this.startDate.getTime() / 1000);
    }
    if (this.finishDate) {
      this.finishDate.setHours(0, 0, 0, 0);
      this.finishDate.setTime(this.finishDate.getTime() + 86400000);
      finishDate = Math.round(this.finishDate.getTime() / 1000);
    }
    this.values.load(this.filterDevName.nativeElement.value, startDate, finishDate, this.filterRawType, ofs, this.paginator.pageSize);
    this.temperatureService.count(this.filterDevName.nativeElement.value, startDate, finishDate, this.filterRawType).subscribe(
      value => {
        if (value) {
          this.paginator.length = value;
        }
      });
  }

  startChange(v: Date): void {
    v.setHours(0, 0, 0, 0);
    this.startDate = v;
    this.load();
  }

  finishChange(v: Date): void {
    v.setHours(0, 0, 0, 0);
    v.setTime(v.getTime() + 86400000); // add one day
    this.finishDate = v;
    this.load();
  }

  filterRaw(v: string): void {
    this.filterRawType = v;
    this.load();
  }

  resetFilter(): void {
    this.filterRawType = '';
    
    this.startDate.setTime(0);
    this.filterStartDate.nativeElement.value = null;
    
    this.finishDate = new Date();
    this.filterFinishDate.nativeElement.value = null;
    this.filterDevName.nativeElement.value = '';
    
    this.load();
  }

  showRaw(): void {
    this.router.navigateByUrl('/raw');
  }
  
  showDetails(val: RawRecord): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      value: val
    };
    // const dialogRef = this.dialog.open(DialogOrderComponent, d);
  }

  toggleRow(element: { expanded: boolean; }) {
    if (typeof(element.expanded) === 'undefined')
      element.expanded = false;
    else  
      element.expanded = !element.expanded
  }
}
