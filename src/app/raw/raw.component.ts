import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { StartFinish } from '../model/startfinish';
import { RawRecord } from '../model/rawrecord';
import { RawSheet } from '../model/raw-sheet';

import { EnvAppService } from '../env-app.service';
import { RawService } from '../service/raw.service';
import { RawDataSource } from '../service/raw.ds';

import { DialogDatesSelectComponent } from '../dialog-dates-select/dialog-dates-select.component';
import { DialogSheetFormatComponent } from '../dialog-sheet-format/dialog-sheet-format.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';


@Component({
  selector: 'app-raw',
  templateUrl: './raw.component.html',
  styleUrls: ['./raw.component.css']
})
export class RawComponent {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('startDate') filterStartDate: ElementRef;
  @ViewChild('finishDate') filterFinishDate: ElementRef;
  @ViewChild('filterDevName') filterDevName: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public values: RawDataSource;

  public displayedColumns: string[] = [
    'id', 'raw', 'devname', 'loraaddr', 'received'];

  
  filterRawType = '';


  constructor(
    private router: Router,
    private env: EnvAppService,
    private rawService: RawService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.values = new RawDataSource(this.rawService);
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

  load(): void {
    const ofs = this.paginator.pageIndex * this.paginator.pageSize;
    const sf = this.getStartFinish(true);
    this.values.load(this.filterDevName.nativeElement.value, sf.start, sf.finish, this.filterRawType, ofs, this.paginator.pageSize);
    this.rawService.count(this.filterDevName.nativeElement.value, sf.start, sf.finish, this.filterRawType).subscribe(
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
    this.paginator.pageIndex = 0;
    this.load();
  }

  finishChange(): void {
    this.paginator.pageIndex = 0;
    this.load();
  }

  filterRaw(v: string): void {
    this.filterRawType = v;
    this.paginator.pageIndex = 0;
    this.load();
  }

  resetFilter(): void {
    this.filterRawType = '';
    this.paginator.pageIndex = 0;

    this.filterStartDate.nativeElement.value = null;
    
    this.filterFinishDate.nativeElement.value = null;
    this.filterDevName.nativeElement.value = '';
    
    this.load();
  }

  reload(): void {
    this.paginator.pageIndex = 0;
    this.load();
  }

  showDetails(val: RawRecord): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      value: val
    };
    // const dialogRef = this.dialog.open(DialogOrderComponent, d);
  }

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

  saveSheet(sf: StartFinish, typ: number): void {
    // update date
    this.filterStartDate.nativeElement.value = formatDate(new Date(sf.start * 1000), 'dd.MM.yyyy', 'en-US');
    this.filterFinishDate.nativeElement.value = formatDate(new Date(sf.finish * 1000), 'dd.MM.yyyy', 'en-US');

    this.rawService.list(this.filterDevName.nativeElement.value, sf.start, sf.finish, '',  0, 32768).subscribe(value => {
      const workbook = xlsx.utils.book_new();

      const addr2record = new Map<string, RawSheet[]>();
      // group rows by year-plume
      value.forEach(row => {
        const k = row.loraaddr;
        const sheetRow = new RawSheet(row);
        if (addr2record.has(k)) {
          const v = addr2record.get(k);
          if (v)
            v.push(sheetRow);
        } else
          addr2record.set(k, [sheetRow]);
      });
        
      // save each group
      for (let e of addr2record.entries()) {
        const worksheet = xlsx.utils.json_to_sheet(e[1]);
        xlsx.utils.sheet_add_aoa(worksheet, [['№', 'Пакет (hex)', 'Устройство (модем)', 'Адрес', 'Время получения']]);
        const fn = this.env.getSheetFileName(sf);
        if (typ == 6) {
          const csv = xlsx.utils.sheet_to_csv(worksheet, { strip: true });
          const data:Blob = new Blob([csv], { type: this.env.MIME_CSV });
          FileSaver.saveAs(data, fn + '-' + e[0] + '.csv');
        } else {
          xlsx.utils.book_append_sheet(workbook, worksheet, e[0]);
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
        this.saveSheet(sf, value);
      });
    } else {
      this.saveSheet(sf, this.env.settings.sheetType);
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
      title: 'Безвозвратно удалить пакеты',
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
  this.rawService.rm(sf).subscribe(
    value => {
      this.load();
    },
    error => {
      this.env.onError(error);
    });
}

}
