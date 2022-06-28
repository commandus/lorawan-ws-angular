import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TemperatureRecord } from '../model/temperaturerecord';
import { ResponseCount } from '../model/responsecount';

import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TemperatureService {

  constructor(private httpClient: HttpClient) { }

  mkQuery(q: string, kosaYearPrefix: string, startDate: number, finishDate: number, devNamePrefix: string): string {
  
    if (startDate)
      q += '&measured-ge=' + startDate;
    if (finishDate)
      q += '&measured-le=' + finishDate;
    if (kosaYearPrefix.length) {
      const parts = kosaYearPrefix.split("-");
      if (parts.length) {
        if (parts.length >= 2) {
          if (parts[0].length)
            q += '&year=' + parts[0];
          if (parts[1].length)
             q += '&kosa=' + parts[1];
        } else {
          if (parts[0].length)
            q += '&year=' + parts[0];
        }
      }
      
    }
    if (devNamePrefix.length)
      q += '&devname-like=' + devNamePrefix + '%';
    return q;
  }

  list(kosaYearPrefix: string, startDate: number, finishDate: number, devNamePrefix: string,
    ofs: number, pagesize: number): Observable<any> {
    return this.httpClient.get<TemperatureRecord[]>(config.endpoint.t.url
      + this.mkQuery('?o=' + ofs + '&s=' + pagesize, kosaYearPrefix, startDate, finishDate, devNamePrefix))
      .pipe(
        map(function(response: TemperatureRecord[]) {
          return response;
      }));
    }

  count(devName: string, startDate: any, finishDate: any, packet: any): Observable<number> {
    return this.httpClient.get<ResponseCount[]>(config.endpoint.t_count.url
      + this.mkQuery('?', devName, startDate, finishDate, packet))
    .pipe(
      map(function(response: ResponseCount[]) {
        return response.length ? response[0].cnt : 0;
    }));
  }

  get(id: number): Observable<any> {
    return this.httpClient.get(config.endpoint.t_id.url + '?id=' + id);
  }

  add(value: TemperatureRecord): Observable<any> {
    return this.httpClient.post(config.endpoint.t.url, value);
  }

  rm(id: number): Observable<any> {
    return this.httpClient.delete(config.endpoint.t.url + '?id=' + id);
  }

  update(value: TemperatureRecord): Observable<any> {
    return this.httpClient.put(config.endpoint.t.url, value);
  }
}
