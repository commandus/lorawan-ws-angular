import { fromEvent, Observable } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CollectionViewer, ListRange, SelectionModel } from '@angular/cdk/collections';

import { RawRecord } from '../model/rawrecord';

import { EnvAppService } from '../env-app.service';
import { PassportDataSource } from '../service/passport.ds.service';
import { PassportService } from '../service/passport.service';
import { Passport, PlumeId } from '../model/passport';
import { StartFinish } from '../model/startfinish';
import { TemperatureService } from '../service/temperature.service';
import { DialogDatesSelectComponent } from '../dialog-dates-select/dialog-dates-select.component';
import { DialogSheetFormatComponent } from '../dialog-sheet-format/dialog-sheet-format.component';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

// import { DialogOrderComponent } from '../dialog-order/dialog-order.component';

class dumbCollectionViewer implements CollectionViewer {
  viewChange: Observable<ListRange>;
}


@Component({
  selector: 'app-passport-list',
  templateUrl: './passport-list.component.html',
  styleUrls: ['./passport-list.component.css']
})
export class PassportListComponent {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filterKosaYear') filterKosaYear: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public values: PassportDataSource;
  public selection = new SelectionModel<number>(true, []);
  public selectionMode = 0; // 0- manually selected, 1- select all, 2- unselect all
  public displayedColumns: string[] = ['id', 'name', 'modified', 'sensor-count', 'plume-t', 'download'];

  private savedSheetStartFinish = new StartFinish(this.env.today() - 86400, this.env.today());
  private savedWorkSheets = new Map<string, xlsx.WorkSheet>();
  private workSheetsCount = 0;

  constructor(
    public env: EnvAppService,
    private passportService: PassportService,
    private temperatureService: TemperatureService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.values = new PassportDataSource(this.passportService);
  }

  checkAll(value: Passport[]): void {
    {
      switch (this.selectionMode) {
        case 1:
          value.forEach(v => {
            this.selection.select(v.id.year * 1000 + v.id.plume);  
          });
          break;
        case 2:  
          this.selection.clear()
          break;
        }
    }
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
          this.paginator.pageIndex = 0;
          this.load();
        })
    )
    .subscribe();

    this.sort.sortChange
    .pipe(
      tap(() => {
        this.paginator.pageIndex = 0;
        this.load();
      })
    )
    .subscribe();

    this.values.connect(new dumbCollectionViewer).subscribe(value => this.checkAll(value));
  }

  load(): void {
    const ofs = this.paginator.pageIndex * this.paginator.pageSize;
    const [year, plume] = this.env.filterExtract(this.filterKosaYear.nativeElement.value);
    this.values.load(year, plume, ofs, this.paginator.pageSize);
    this.passportService.count(year, plume).subscribe(
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
  
  resetFilter(): void {
    this.filterKosaYear.nativeElement.value = '';
    this.paginator.pageIndex = 0;
    this.load();
  }

  reload(): void {
    this.paginator.pageIndex = 0;
    this.load();
  }

  saveFile(id?: PlumeId): void {
    const kosaYearPrefix = this.filterKosaYear.nativeElement.value;
    let year = 0;
    let kosa = 0;
    if (id) {
      year = id.year;
      kosa = id.plume;
    } else {
      if (kosaYearPrefix.length) {
        const parts = kosaYearPrefix.split("-");
        if (parts.length) {
          if (parts.length >= 2) {
            if (parts[0].length)
              year = parts[0];
            if (parts[1].length)
              kosa = parts[1];
          } else {
            if (parts[0].length)
              year = parts[0];
          }
        }
      }
    }

    this.passportService.passportFile(year, kosa).subscribe(
      value => {
        const data: Blob = new Blob([value], { type: 'text/plain;charset=UTF-8' });
        FileSaver.saveAs(data, 'N' + year + '-' + kosa + '.txt');
      },
      error => {
        let snackBarRef = this.snackBar.open('Сервис временно недоступен', 'Повторить');
        snackBarRef.onAction().subscribe(() => {
          this.saveFile();
        });
        console.error(error);
      });
  }

  showDetails(val: RawRecord): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      value: val
    };
    // const dialogRef = this.dialog.open(DialogOrderComponent, d);
  }

  selectAll(value: boolean): void
  {
    this.selectionMode = value ? 1 : 2;
    const dcv = new dumbCollectionViewer;
    this.values.connect(dcv).subscribe(value => this.checkAll(value));
  }    

  tooglePassportSelection(v: Passport): void {
    this.selectionMode = 0;
    this.selection.toggle(v.id.year * 1000 + v.id.plume);
  }
  
  isPassportSelected(v: Passport) {
    return this.selection.isSelected(v.id.year * 1000 + v.id.plume);
  }
  
  saveWorkBook(typ: number) {
    const workbook = xlsx.utils.book_new();
    const fn = this.env.getSheetFileName(this.savedSheetStartFinish);
    if (typ == 6) {
      // save to different files
      for (let e of this.savedWorkSheets.entries()) {
        const csv = xlsx.utils.sheet_to_csv(e[1], { strip: true });
        const data:Blob = new Blob([csv], { type: this.env.MIME_CSV });
        FileSaver.saveAs(data, fn + '-' + e[0] + '.csv');
      }
      return;
    }

    // save to one file
    for (let e of this.savedWorkSheets.entries()) {
      xlsx.utils.book_append_sheet(workbook, e[1], e[0]);
    }
    const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data:Blob = new Blob([excelBuffer], { type: this.env.MIME_XSLX});
    FileSaver.saveAs(data, fn + '.xlsx');

    this.savedWorkSheets.clear();
  }

  saveSheet(year: number, plume: number, startfinish: StartFinish, typ: number) : void
  {
    const kosaYearPrefix = year + '-' + plume;
    this.temperatureService.list(kosaYearPrefix, startfinish.start, startfinish.finish, '',  0, 32768).subscribe(value => {
      const rows = this.env.tRecords2rows(value);
      const worksheet = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.sheet_add_aoa(worksheet, this.env.getSheetHeading());
        this.savedWorkSheets.set('N' + kosaYearPrefix, worksheet);
      if (this.savedWorkSheets.size == this.workSheetsCount) {
        // done
        this.saveWorkBook(typ);
      }
    });
  }

  saveSheets(typ: number): void
  {
    this.savedWorkSheets.clear();
    switch (this.selectionMode) {
      case 0:
        // selection
        this.workSheetsCount = this.selection.selected.length;
        this.selection.selected.forEach(y1000p => {
          const year = Math.floor(y1000p / 1000);
          const plume = y1000p - (year * 1000);
          this.saveSheet(year, plume, this.savedSheetStartFinish, typ);
        });
        break;
      case 1:
        // selected all
        const [year, plume] = this.env.filterExtract(this.filterKosaYear.nativeElement.value);
        this.passportService.list(year, plume, 0, 32768).subscribe(values => {
          this.workSheetsCount = values.length;
          values.forEach(p => {
            this.saveSheet(p.id.year, p.id.plume, this.savedSheetStartFinish, typ);
          });
        });
        break;
    }
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
        this.env.settings.save();
        this.saveSheets(value);
      });
    } else {
      this.saveSheets(this.env.settings.sheetType);
    }
  }

  selectDateAndSaveSheet(): void 
  {
    switch (this.selectionMode) {
      case 0:
        // skip paged selection
        if (this.selection.isEmpty()) {
          this.snackBar.open('Ничего не выбрано. Пометьте галочки.', 'Закрыть');
          return;
        }
        break;
      case 1:
        // select all
        break;
      default:
          // all unselected
        this.snackBar.open('Ничего не выбрано. Пометьте галочки.', 'Закрыть');
        return;
    }

    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      title: 'Установите даты',
      message: 'Начальную и конечную',
      startfinish: this.savedSheetStartFinish
    };
    const dialogRef = this.dialog.open(DialogDatesSelectComponent, d);
    dialogRef.componentInstance.selected.subscribe((value) => {
      this.savedSheetStartFinish.start = value.start;
      this.savedSheetStartFinish.finish = value.finish;
      this.selectSheetTypeAndSaveSheets();
    });
  }
}
