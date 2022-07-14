import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Passport } from '../model/passport';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class PassportService {

  constructor(private httpClient: HttpClient) {};

  list(kosaYear: number, plumeNumber: number, ofs: number, pagesize: number): Observable<Passport[]> {
    let u = config.endpoint.passport.url + '?year=' + kosaYear + '&plume=' + plumeNumber + '&o=' + ofs + '&s=' + pagesize;
    

    return this.httpClient.get<Passport[]>(u)
      .pipe(
        map((response: Passport[]) => 
          response.filter(
            function(p: Passport): boolean {
              return (!kosaYear || p.id.year == kosaYear) 
                && (!plumeNumber || p.id.plume == plumeNumber) ;
            }))
      , map(p=>p.sort((l: Passport, r:Passport) => {
        if (l.id.year < r.id.year)
          return -1;
        if (l.id.year > r.id.year)
          return 1;
        if (l.id.plume < r.id.plume)
          return -1;
        if (l.id.plume > r.id.plume)
          return 1;
        return 0;
      })));
  }

  count(kosaYear: number, plumeNumber: number): Observable<number> {
    let u = config.endpoint.passport_count.url + '?year=' + kosaYear + '&plume=' + plumeNumber;
  
    return this.httpClient.get<number>(u);
  }

  passportFile(kosaYear: number, plumeNumber: number): Observable<string> {
    let u = config.endpoint.passportFile.url + '?year=' + kosaYear + '&plume=' + plumeNumber;
    return this.httpClient.get(u, { responseType: 'text'});
  };
}
