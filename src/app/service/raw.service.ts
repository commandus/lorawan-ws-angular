import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RawRecord } from '../model/rawrecord';
import { ResponseCount } from '../model/responsecount';

import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class RawService {

  constructor(private httpClient: HttpClient) { }

  mkQuery(q: string, devName: string, startDate: number, finishDate: number, packet: string): string {
    if (startDate)
      q += '&received-ge=' + startDate;
    if (finishDate)
      q += '&received-le=' + finishDate;
    if (devName.length)
      q += '&devname-like=' + devName + '%';
    if (packet.length)
      q += '&raw-like=' + packet + '%';
    return q;
  }

  list(devName: string, startDate: number, finishDate: number, packetTypes: string,
    ofs: number, pagesize: number): Observable<any> {
    return this.httpClient.get(config.endpoint.raw.url
      + this.mkQuery('?o=' + ofs + '&s=' + pagesize, devName, startDate, finishDate, packetTypes))
      .pipe(
        map(function(response: any) {
          return response;
      }));
    }

  count(devName: string, startDate: any, finishDate: any, packet: any): Observable<number> {
    return this.httpClient.get<ResponseCount[]>(config.endpoint.raw_count.url
      + this.mkQuery('?', devName, startDate, finishDate, packet))
    .pipe(
      map(function(response: ResponseCount[]) {
        return response.length ? response[0].cnt : 0;
    }));
  }

  get(id: number): Observable<any> {
    return this.httpClient.get(config.endpoint.raw_id.url + '?id=' + id);
  }

  add(value: RawRecord): Observable<any> {
    return this.httpClient.post(config.endpoint.raw.url, value);
  }

  rm(id: number): Observable<any> {
    return this.httpClient.delete(config.endpoint.raw.url + '?id=' + id);
  }

  update(value: RawRecord): Observable<any> {
    return this.httpClient.put(config.endpoint.raw.url, value);
  }
}
