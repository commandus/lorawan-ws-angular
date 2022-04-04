import { CollectionViewer, DataSource} from '@angular/cdk/collections';
import { BehaviorSubject, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { RawRecord } from '../model/rawrecord';
import { RawService } from './raw.service';

/**
 * @see https://blog.angular-university.io/angular-material-data-table/
 * @see https://github.com/angular-university/angular-material-course/tree/2-data-table-finished
 */
export class RawDataSource implements DataSource<RawRecord> {
  private subject = new BehaviorSubject<RawRecord[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading = this.loadingSubject.asObservable();

  constructor(private service: RawService) { }

  connect(collectionViewer: CollectionViewer): Observable<RawRecord[]> {
    return this.subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.subject.complete();
      this.loadingSubject.complete();
  }

  load(filter: string, submitDate: any, deliveryDate: any, state: any, goodsFilter: any, flags: number,
       offset: number, pagesize: number): void {
    this.loadingSubject.next(true);
    this.service.list(filter, submitDate, deliveryDate, state, goodsFilter, flags, offset, pagesize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(
      value => {
        this.subject.next(value);
      });
  }
}
