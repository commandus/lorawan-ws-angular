import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';

import { StartFinish } from '../model/startfinish';
import { TemperatureSheet } from '../model/temperature-sheet';

import { EnvAppService } from '../env-app.service';
import { TemperatureService } from '../service/temperature.service';
import { TemperatureDataSource } from '../service/temperature.ds';

import { DialogDatesSelectComponent } from '../dialog-dates-select/dialog-dates-select.component';
import { DialogSheetFormatComponent } from '../dialog-sheet-format/dialog-sheet-format.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent {
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
    public env: EnvAppService,
    private temperatureService: TemperatureService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.values = new TemperatureDataSource(this.temperatureService);
    
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
        this.env.onError(error, this);
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

  orderAndSaveSheet(sf: StartFinish, typ: number): void {
    // update date
    this.filterStartDate.nativeElement.value = formatDate(new Date(sf.start * 1000), 'dd.MM.yyyy', 'en-US');
    this.filterFinishDate.nativeElement.value = formatDate(new Date(sf.finish * 1000), 'dd.MM.yyyy', 'en-US');

    this.temperatureService.list(this.filterKosaYear.nativeElement.value, sf.start, sf.finish, '',  0, 32768).subscribe(value => {
      const savedJson = new Map<number, TemperatureSheet[]>();
      // convert to plain row
      const rows = this.env.tRecords2rows(value);
      // group rows by year-plume
      rows.forEach(row => {
        const k = row.year * 1000 + row.kosa;
        if (savedJson.has(k)) {
          const v = savedJson.get(k);
          if (v)
            v.push(row);
        } else
          savedJson.set(k, [row]);
      });
      const workbook = xlsx.utils.book_new();
      // save each group
      for (let e of savedJson.entries()) {
        const year = Math.floor(e[0] / 1000);
        const plume = e[0] - year * 1000;
        const kosaYearPrefix = year + '-' + plume;;  
        const worksheet = xlsx.utils.json_to_sheet(e[1]);
        const fn = this.env.getSheetFileName(sf);
        if (typ == 6) {
          const csv = xlsx.utils.sheet_to_csv(worksheet, { strip: true });
          const data:Blob = new Blob([csv], { type: this.env.MIME_CSV });
          FileSaver.saveAs(data, fn + '-' + kosaYearPrefix + '.csv');
        } else {
          xlsx.utils.book_append_sheet(workbook, worksheet, 'N' + kosaYearPrefix);
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: this.env.MIME_XSLX });
          FileSaver.saveAs(data, fn + '.xlsx');
        }
      }
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
        this.env.settings.save();
        this.orderAndSaveSheet(sf, value);
      });
    } else {
      this.orderAndSaveSheet(sf, this.env.settings.sheetType);
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

  public selectDateAndRemove(): void 
  {
    const sf = this.getStartFinish(false);
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      title: 'Безвозвратно удалить записи',
      message: 'Укажите период, в котором записи будут удалены',
      startfinish: sf
    };
    const dialogRef = this.dialog.open(DialogDatesSelectComponent, d);
    dialogRef.componentInstance.selected.subscribe((value) => {
      sf.start = value.start;
      sf.finish = value.finish;
      this.rmStartFinish(sf);
    });
  }

  private rmStartFinish(sf: StartFinish): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.disableClose = false;
    d.data = {
      title: 'Удалить записи?',
      message: 'Восстановить будет невозможно.'
    };
    const dialogRef = this.dialog.open(DialogConfirmComponent, d);
    dialogRef.afterClosed().subscribe(
        data => {
          if (data.yes) {
            this.rmI(sf);
          }
        }
    );
}

private rmI(sf: StartFinish): void {
  this.temperatureService.rm(sf).subscribe(
    value => {
      this.load();
    },
    error => {
      this.env.onError(error);
    });
}

}
