import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';

import { EnvAppService } from '../env-app.service';
import { TemperatureService } from '../service/temperature.service';
import { TemperatureDataSource } from '../service/temperature.ds';
import { StartFinish } from 'app/model/startfinish';
import { DialogDatesSelectComponent } from '../dialog-dates-select/dialog-dates-select.component';
import { DialogSheetFormatComponent } from '../dialog-sheet-format/dialog-sheet-format.component';

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
  public year: number;
  public plume: number;
  
  public displayedColumns: string[] = [
    'measured', 'kosa-year', 'tp', 'devname', 'vcc', 'vbat'
  ];

  public expandedColumns: string[] = [
    'expandedDetail'
  ];

  startDate = new Date(0);
  finishDate = new Date();

  public sheetStartFinish = new StartFinish(Math.floor(this.startDate.getTime() / 1000), Math.floor(this.finishDate.getTime() / 1000));

  filterDeviceName = '';

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    public env: EnvAppService,
    private temperatureService: TemperatureService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.year = activateRoute.snapshot.params['year'];
    this.plume = activateRoute.snapshot.params['plume'];
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
    this.sheetStartFinish.start = Math.floor(this.startDate.getTime() / 1000);
    this.load();
  }

  finishChange(): void {
    this.finishDate = this.env.parseDate(this.filterFinishDate);
    this.finishDate.setTime(this.finishDate.getTime() + 86400000); // add one day
    this.sheetStartFinish.finish = Math.floor(this.finishDate.getTime() / 1000)
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

  saveSheet(): void
  {
    const kosaYearPrefix = this.year + '-' + this.plume;
    this.temperatureService.list(kosaYearPrefix, startfinish.start, startfinish.finish, '',  0, 0).subscribe(value => {
      const worksheet = xlsx.utils.json_to_sheet(value);
      this.savedWorkSheets.set('N' + this.year + '-' + this.plume, worksheet);
        this.saveWorkBook();
      });
  }

  selectSheetTypeAndSaveSheets() : void {
    if (!this.env.settings.sheetType) {
      const d = new MatDialogConfig();
      d.autoFocus = true;
      d.data = {
        title: 'Выберите формат',
        message: 'электронной таблицы',
        sheetType: this.env.settings.sheetType
      };
      const dialogRef = this.dialog.open(DialogSheetFormatComponent, d);
      dialogRef.componentInstance.selected.subscribe((value) => {
        this.env.settings.sheetType = value;
        this.saveSheet();
      });
    } else {
      this.saveSheet();
    }
  }

  selectDateAndSaveSheet(): void 
  {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      title: 'Установите даты',
      message: 'Начальную и конечную',
      startfinish: this.sheetStartFinish
    };
    const dialogRef = this.dialog.open(DialogDatesSelectComponent, d);
    dialogRef.componentInstance.selected.subscribe((value) => {
      this.sheetStartFinish.start = value.start;
      this.sheetStartFinish.finish = value.finish;
      this.selectSheetTypeAndSaveSheets();
    });
  }

}
