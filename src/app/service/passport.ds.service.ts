import { CollectionViewer, DataSource} from '@angular/cdk/collections';
import { Passport } from '../model/passport';
import { BehaviorSubject, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PassportService } from './passport.service';

/**
 * @see https://blog.angular-university.io/angular-material-data-table/
 * @see https://github.com/angular-university/angular-material-course/tree/2-data-table-finished
 */
export class PassportDataSource implements DataSource<Passport> {
  private subject = new BehaviorSubject<Passport[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading = this.loadingSubject.asObservable();

  constructor(private service: PassportService) { }

  connect(collectionViewer: CollectionViewer): Observable<Passport[]> {
    return this.subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.subject.complete();
      this.loadingSubject.complete();
  }

  load(kosaYear: number, plumeNumber: number, ofs: number, pagesize: number): void {
    this.loadingSubject.next(true);
    this.service.list(kosaYear, plumeNumber, ofs, pagesize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(
      value => {
        this.subject.next(value);
      });
  }
}
