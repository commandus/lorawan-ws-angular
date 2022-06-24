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

  list(kosaYear?: number, plumeNumber?: number, ofs?: number, pagesize?: number): Observable<Passport[]> {
    let u = config.endpoint.passports.url;
    if (kosaYear)
      u += '?year=' + kosaYear;
      if (kosaYear)
      u += '?plume=' + plumeNumber;
    if (ofs)
      u += '?o=' + ofs;
    if (pagesize)
      u += '&s=' + pagesize;

    return this.httpClient.get<Passport[]>(u)
      .pipe(
        map((response: Passport[]) => 
          response.filter(
            function(p: Passport): boolean {
              return (!kosaYear || p.id.year == kosaYear) 
                && (!plumeNumber || p.id.plume == plumeNumber) ;
            }))
      );
  }

  count(kosaYear?: number, plumeNumber?: number): Observable<number> {
    let u = config.endpoint.passports.url;
    if (kosaYear)
      u += '?year=' + kosaYear;
      if (kosaYear)
      u += '?plume=' + plumeNumber;
  
    return this.httpClient.get<number>(u)
      .pipe(
        map((response: number) => response
      ));
  }
}

