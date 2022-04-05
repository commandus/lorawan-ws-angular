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

  mkQuery(q: string, devName: string, startDate: number, finishDate: number, packet: string): string {
    /*
    if (startDate)
      q += '&received-ge=' + startDate;
    if (finishDate)
      q += '&received-le=' + finishDate;
    if (devName.length)
      q += '&devname-like=' + devName + '%';
    if (packet.length)
      q += '&raw-like=' + packet + '%';
      */
    return q;
  }

  list(devName: string, startDate: number, finishDate: number, packet: string,
    ofs: number, pagesize: number): Observable<any> {
    return this.httpClient.get<TemperatureRecord[]>(config.endpoint.t.url
      + this.mkQuery('?o=' + ofs + '&s=' + pagesize, devName, startDate, finishDate, packet))
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
