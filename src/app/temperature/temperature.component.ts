import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  @ViewChild('filterKosaYear') filterKosaYear: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public values: TemperatureDataSource;
  
  public displayedColumns: string[] = [
    'measured', 'kosa-year', 'tp', 'devname', 'vcc', 'vbat'
  ];

  public expandedColumns: string[] = [
    'expandedDetail'
  ];

  startDate = new Date(0);
  finishDate = new Date();
  filterDeviceName = '';

  constructor(
    private router: Router,
    private env: EnvAppService,
    private temperatureService: TemperatureService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
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

    fromEvent(this.filterKosaYear.nativeElement, 'keyup')
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
    this.values.load(this.filterKosaYear.nativeElement.value, startDate, finishDate, this.filterDeviceName, ofs, this.paginator.pageSize);
    this.temperatureService.count(this.filterKosaYear.nativeElement.value, startDate, finishDate, this.filterDeviceName).subscribe(
      value => {
        if (value) {
          this.paginator.length = value;
        }
      },
      error => {
        let snackBarRef = this.snackBar.open('Сервис временно недоступен', 'Повторить');
        snackBarRef.onAction().subscribe(() => {
          this.load();
        });
        console.error(error);
      });
  }

  startChange(): void {
    this.startDate = this.env.parseDate(this.filterStartDate);
    this.load();
  }

  finishChange(): void {
    this.finishDate = this.env.parseDate(this.filterFinishDate);
    this.finishDate.setTime(this.finishDate.getTime() + 86400000); // add one day
    this.load();
  }

  resetFilter(): void {
    this.filterDeviceName = '';
    
    this.startDate.setTime(0);
    this.filterStartDate.nativeElement.value = '';
    
    this.finishDate = new Date();
    this.filterFinishDate.nativeElement.value = '';
    this.filterKosaYear.nativeElement.value = '';
    
    this.load();
  }

  toggleRow(element: { expanded: boolean; }) {
    if (typeof(element.expanded) === 'undefined')
      element.expanded = false;
    else  
      element.expanded = !element.expanded
  }
}
