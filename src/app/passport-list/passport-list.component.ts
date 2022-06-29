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
import { DialogDatesSelectComponent } from '../dialog-dates-select/dialog-dates-select.component';
import { StartFinish } from '../model/startfinish';
import { TemperatureService } from '../service/temperature.service';

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

  year = 0;
  plume = 0;
  
  savedSheetStartFinish = new StartFinish(this.env.today()- 86400, this.env.today());

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
    const kosaYearPrefix = this.filterKosaYear.nativeElement.value;
    let year = 0;
    let kosa = 0;
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

    this.values.load(year, kosa, ofs, this.paginator.pageSize);
    this.passportService.count(year, kosa).subscribe(
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
        if (value) {
          const f = new Blob([value], { type: 'text/plain'});
          const l = document.createElement('a');
          l.href = URL.createObjectURL(f);
          l.download = 'N' + year + '-' + kosa + '.txt';
          l.click();
          l.remove();
        }
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
  
  saveSheet(year: number, plume: number, startfinish: StartFinish) : void
  {
    const kosaYearPrefix = year + '-' + plume;
    this.temperatureService.list(kosaYearPrefix, startfinish.start, startfinish.finish, '',  0, 0).subscribe(value => {
      console.log(value);
    });
    console.log();
  }

  saveSheets() : void {
    switch (this.selectionMode) {
      case 0:
        // selection
        this.selection.selected.forEach(y1000p => {
          const year = y1000p / 1000;
          const plume = y1000p - (year * 1000);
          this.saveSheet(year, plume, this.savedSheetStartFinish);
        });
        break;
      case 1:
        // selected all
        this.passportService.list(0, 0, 0, 0).subscribe(values => {
          values.forEach(p => {
            this.saveSheet(p.id.year, p.id.plume, this.savedSheetStartFinish);
          });
        });
        break;
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
      value: this.savedSheetStartFinish
    };
    const dialogRef = this.dialog.open(DialogDatesSelectComponent, d);
    dialogRef.componentInstance.selected.subscribe((value) => {
      this.savedSheetStartFinish.start = value.start;
      this.savedSheetStartFinish.finish = value.finish;
      this.saveSheets();
    });
  }
}
