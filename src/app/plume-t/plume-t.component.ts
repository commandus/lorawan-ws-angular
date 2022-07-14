import { tap, startWith, delay } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { EnvAppService } from '../env-app.service';
import { TemperatureService } from '../service/temperature.service';
import { TemperatureDataSource } from '../service/temperature.ds';

import { StartFinish } from '../model/startfinish';
import { DialogDatesSelectComponent } from '../dialog-dates-select/dialog-dates-select.component';
import { DialogSheetFormatComponent } from '../dialog-sheet-format/dialog-sheet-format.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-plume-t',
  templateUrl: './plume-t.component.html',
  styleUrls: ['./plume-t.component.css']
})
export class PlumeTComponent {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('startDate') filterStartDate: ElementRef;
  @ViewChild('finishDate') filterFinishDate: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  
    public values: TemperatureDataSource;
    public year: number;
    public plume: number;


    public displayedColumns: string[] = [
      'measured', 'tp', 'devname', 'vcc', 'vbat'
    ];

    filterDeviceName = '';
  
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
    
    constructor(
      private dialog: MatDialog,
      private activateRoute: ActivatedRoute,
      private env: EnvAppService,
      private temperatureService: TemperatureService
    ) {
      this.year = this.activateRoute.snapshot.params['year'];
      this.plume = this.activateRoute.snapshot.params['plume'];
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
      const sf = this.getStartFinish(true);
      this.values.load(this.year + '-' + this.plume, sf.start, sf.finish, this.filterDeviceName, ofs, this.paginator.pageSize);
      this.temperatureService.count(this.year + '-' + this.plume, sf.start, sf.finish, this.filterDeviceName).subscribe(
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
      this.load();
    }
  
    toggleRow(element: { expanded: boolean; }) {
      if (typeof(element.expanded) === 'undefined')
        element.expanded = false;
      else  
        element.expanded = !element.expanded
    }

    saveSheet(startFinish: StartFinish, typ: number): void
    {
      const kosaYearPrefix = this.year + '-' + this.plume;
      // 32768 minus header
      this.temperatureService.list(kosaYearPrefix, startFinish.start, startFinish.finish, '',  0, 32767).subscribe(value => {
        // convert to plain row
        const rows = this.env.tRecords2rows(value);
        // add spreadsheet
        const worksheet = xlsx.utils.json_to_sheet(rows);
        xlsx.utils.sheet_add_aoa(worksheet, this.env.getSheetHeading());
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'N' + kosaYearPrefix);
        // save to file (once)
        const fn = this.env.getSheetFileName(startFinish);
        if (typ == 6) {
          const csv = xlsx.utils.sheet_to_csv(worksheet, { strip: true });
          const data:Blob = new Blob([csv], { type: this.env.MIME_CSV });
          FileSaver.saveAs(data, fn + '.csv');
        } else {
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data:Blob = new Blob([excelBuffer], { type: this.env.MIME_XSLX });
          FileSaver.saveAs(data, fn + '.xlsx');
        }
      });
    }
  
    selectSheetTypeAndSaveSheets(startFinish: StartFinish) : void {
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
          this.saveSheet(startFinish, value);
        });
      } else {
        this.saveSheet(startFinish, this.env.settings.sheetType);
      }
    }
  
    selectDateAndSaveSheet(): void 
    {
      const sf = this.getStartFinish(false);
      const d = new MatDialogConfig();
      d.autoFocus = true;
      d.data = {
        title: 'Укажите даты измерения',
        message: 'Начальную и конечную',
        startfinish: sf
      };
      const dialogRef = this.dialog.open(DialogDatesSelectComponent, d);
      dialogRef.componentInstance.selected.subscribe((value) => {
        // update date
        this.filterStartDate.nativeElement.value = formatDate(new Date(value.start * 1000), 'dd.MM.yyyy', 'en-US');
        this.filterFinishDate.nativeElement.value = formatDate(new Date(value.finish * 1000), 'dd.MM.yyyy', 'en-US');
        // select spreadsheet type
        this.selectSheetTypeAndSaveSheets(sf);
      });
    }
  
  }
  