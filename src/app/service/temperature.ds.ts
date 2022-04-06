import { CollectionViewer, DataSource} from '@angular/cdk/collections';
import { BehaviorSubject, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { TemperatureRecord } from '../model/temperaturerecord';
import { TemperatureService } from './temperature.service';

/**
 * @see https://blog.angular-university.io/angular-material-data-table/
 * @see https://github.com/angular-university/angular-material-course/tree/2-data-table-finished
 */
export class TemperatureDataSource implements DataSource<TemperatureRecord> {
  private subject = new BehaviorSubject<TemperatureRecord[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading = this.loadingSubject.asObservable();

  constructor(private service: TemperatureService) { }

  connect(collectionViewer: CollectionViewer): Observable<TemperatureRecord[]> {
    return this.subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.subject.complete();
      this.loadingSubject.complete();
  }

  load(kosaYearPrefix: string, startDate: any, finishDate: any, devnamePrefix: string,
       offset: number, pagesize: number): void {
    this.loadingSubject.next(true);
    this.service.list(kosaYearPrefix, startDate, finishDate, devnamePrefix, offset, pagesize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(
      value => {
        this.subject.next(value);
      });
  }
}
