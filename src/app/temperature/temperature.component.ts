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
import { StartFinish } from '../model/startfinish';
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

  private getStartFinish(startWith1970: boolean): StartFinish {
    const d2 = Math.floor(new Date().getTime() / 1000);
    let startFinish = new StartFinish(startWith1970 ? 0 : d2 - 86400, d2);
    if (this.env.hasDate(this.filterStartDate)) {
      let d = this.env.parseDate(this.filterStartDate);
      d.setHours(0, 0, 0, 0);
      startFinish.start = Math.floor(d.getTime() / 1000);
    }

    if (this.env.hasDate(this.filterFinishDate)) {
      let d = this.env.parseDate(this.filterFinishDate);
      d.setHours(23, 59, 59, 0);
      startFinish.finish = Math.floor(d.getTime() / 1000);
    }
    return startFinish;
  }

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
    const sf = this.getStartFinish(true);
    const ofs = this.paginator.pageIndex * this.paginator.pageSize;
    
    this.values.load(this.filterKosaYear.nativeElement.value, sf.start, sf.finish, this.filterDeviceName, ofs, this.paginator.pageSize);
    this.temperatureService.count(this.filterKosaYear.nativeElement.value, sf.start, sf.finish, this.filterDeviceName).subscribe(
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
    this.load();
  }

  finishChange(): void {
    this.load();
  }

  resetFilter(): void {
    this.filterDeviceName = '';
    
    this.filterStartDate.nativeElement.value = '';
    
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

  saveSheet(sf: StartFinish): void
  {
    this.temperatureService.list(this.filterKosaYear.nativeElement.value, sf.start, sf.finish, '',  0, 0).subscribe(value => {
      const kosaYearPrefix = this.year + '-' + this.plume;
      const worksheet = xlsx.utils.json_to_sheet(value);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'N' + kosaYearPrefix);
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      const d1 = new Date(sf.start * 1000);
      const d2 = new Date(sf.finish * 1000);
      const fn = formatDate(d1, 'd.M.yy', 'en-US') + '-' + formatDate(d2, 'd.M.yy', 'en-US');
      FileSaver.saveAs(data, fn + '.xlsx');
      // update date
      this.filterStartDate.nativeElement.value = formatDate(new Date(sf.start * 1000), 'd.M.yyyy', 'en-US');
      this.filterFinishDate.nativeElement.value = formatDate(new Date(sf.start * 1000), 'd.M.yyyy', 'en-US');
    });
  }

  selectSheetTypeAndSaveSheets(sf: StartFinish) : void {
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
        this.saveSheet(sf);
      });
    } else {
      this.saveSheet(sf);
    }
  }

  selectDateAndSaveSheet(): void 
  {
    const sf = this.getStartFinish(false);
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      title: 'Установите даты',
      message: 'Начальную и конечную',
      startfinish: sf
    };
    const dialogRef = this.dialog.open(DialogDatesSelectComponent, d);
    dialogRef.componentInstance.selected.subscribe((value) => {
      sf.start = value.start;
      sf.finish = value.finish;
      this.selectSheetTypeAndSaveSheets(sf);
    });
  }

}
