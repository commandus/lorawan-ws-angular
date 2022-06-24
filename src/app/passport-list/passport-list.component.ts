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
  @ViewChild('filterYear') filterYear: ElementRef;
  @ViewChild('filterPlume') filterPlume: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public values: PassportDataSource;

  public displayedColumns: string[] = ['id', 'name'];

  year = 0;
  plume = 0;

  constructor(
    private router: Router,
    private env: EnvAppService,
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

    fromEvent(this.filterYear.nativeElement, 'keyup')
    .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
            this.load();
        })
    )
    .subscribe();

    fromEvent(this.filterPlume.nativeElement, 'keyup')
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
    
    this.values.load(this.filterYear.nativeElement.value, this.filterPlume.nativeElement.value, ofs, this.paginator.pageSize);
    this.passportService.count(this.filterYear.nativeElement.value, this.filterPlume.nativeElement.value).subscribe(
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
    this.filterPlume.nativeElement.value = undefined;
    this.filterYear.nativeElement.value = undefined;
    this.paginator.pageIndex = 0;
   
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

}


