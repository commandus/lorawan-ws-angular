import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { Router } from '@angular/router';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { RawRecord } from '../model/rawrecord';

import { EnvAppService } from '../env-app.service';
import { PassportDataSource } from '../service/passport.ds.service';
import { PassportService } from '../service/passport.service';

// import { DialogOrderComponent } from '../dialog-order/dialog-order.component';


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

  public displayedColumns: string[] = ['id', 'name', 'modified', 'sensor-count', 'plume-t', 'plume-sensor'];

  year = 0;
  plume = 0;

  constructor(
    private router: Router,
    public env: EnvAppService,
    private passportService: PassportService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.values = new PassportDataSource(this.passportService);
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

  saveFile(): void {
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

    this.passportService.passportFile(year, kosa).subscribe(
      value => {
        if (value) {
          const f = new Blob([value], { type: 'text/plain'});
          const l = document.createElement('a');
          l.href = URL.createObjectURL(f);
          l.download = 'passport' + year + '-' + kosa + '.txt';
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

}
