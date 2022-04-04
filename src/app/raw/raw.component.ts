import { fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, startWith, delay } from 'rxjs/operators';

import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { RawRecord } from '../model/rawrecord';

import { EnvAppService } from '../env-app.service';
import { RawService } from '../service/raw.service';
import { RawDataSource } from '../service/raw.ds';

// import { DialogOrderComponent } from '../dialog-order/dialog-order.component';


@Component({
  selector: 'app-raw',
  templateUrl: './raw.component.html',
  styleUrls: ['./raw.component.css']
})
export class RawComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  @ViewChild('createdDate') createdDateInput: ElementRef;
  @ViewChild('deliveryDate') deliveryDateInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public values: RawDataSource;
  
  // 20191030: - orgid, cn, phone. Was 'id', 'orgname', 'state', 'orgid', 'phone', 'cn', 'items', 'deliverydate',  'tag', 'created'
  public displayedColumns: string[] = [
    'id', 'raw', 'devname', 'loraaddr', 'received'
    ];

  filterGoods = 0;
  public state = 0;
  deliveryDate: Date = new Date();
  createdDate: Date = new Date();
  goods = [];

  constructor(
    private router: Router,
    private env: EnvAppService,
    private service: RawService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.values = new RawDataSource(this.service);
    this.cdr.detectChanges();
  }

  ngOnInit() {
    // this.values.sort = this.sort;
    // this.values.paginator = this.paginator;
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

    fromEvent(this.filter.nativeElement, 'keyup')
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
    const f = 0;
    let deliveryDate = 0;
    let createdDate = 0;
    if (this.deliveryDate) {
      this.deliveryDate.setHours(0, 0, 0, 0);
      deliveryDate = Math.round(this.deliveryDate.getTime() / 1000);
    }
    if (this.createdDate) {
      this.createdDate.setHours(0, 0, 0, 0);
      createdDate = Math.round(this.createdDate.getTime() / 1000);
    }
    this.values.load(this.filter.nativeElement.value, createdDate, deliveryDate, this.state, this.filterGoods,
       f, ofs, this.paginator.pageSize);
    this.service.count(this.filter.nativeElement.value, createdDate, deliveryDate, this.state, this.filterGoods, f).subscribe(
      value => {
        if (value) {
          this.paginator.length = value;
        }
      });
  }

  createdChange(v: Date): void {
    v.setHours(0, 0, 0, 0);
    this.createdDate = v;
    this.load();
  }

  deliveryChange(v: Date): void {
    v.setHours(0, 0, 0, 0);
    this.deliveryDate = v;
    this.load();
  }

  resetFilter(): void {
    this.filterGoods = 0;
    this.createdDateInput.nativeElement.value = null;
    this.deliveryDateInput.nativeElement.value = null;
    // this.createdDate = null;
    // this.deliveryDate = null;
    this.filter.nativeElement.value = null;
    this.load();
  }

  add() {
    this.router.navigateByUrl('/order-tomorrow');
  }
  

  onGoodsFilterSelection(id: number) {
    this.filterGoods = id;
    this.load();
  }

  stateClick(val: any): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
    };
    // const dialogRef = this.dialog.open(DialogOrderStateComponent, d);
  }

  showDetails(val: RawRecord): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      value: val
    };
    // const dialogRef = this.dialog.open(DialogOrderComponent, d);
  }

  /*
  

  createdChange(v: Date): void {
    v.setHours(0, 0, 0, 0);
    this.createdDate = v;
    this.load();
  }

  deliveryChange(v: Date): void {
    v.setHours(0, 0, 0, 0);
    this.deliveryDate = v;
    this.load();
  }

  stateChange(): void {
    this.load();
  }

  
  edit
  */

}

