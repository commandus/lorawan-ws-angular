import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RawRecord } from '../model/rawrecord';

import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class RawService {

  constructor(private httpClient: HttpClient) { }

  list(filter: string, submitDate: any, deliveryDate: any, state: any, goodsFilter: any, flags: number,
    ofs: number, pagesize: number): Observable<any> {
    return this.httpClient.get(config.endpoint.raw.url + '?f=' + filter + '&o=' + ofs + '&s=' + pagesize
      + (flags ? '&m=' + flags : '')
      + (submitDate ? '&ts=' + submitDate : '')
      + (deliveryDate ? '&td=' + deliveryDate : '')
      + (state ? '&e=' + state : '')
      + (goodsFilter ? '&g=' + goodsFilter: ''))
      .pipe(
        map(function(response: any) {
          return response;
      }));
    }

  count(filter: string, submitDate: any, deliveryDate: any, state: any, goodsFilter: any, flags: number): Observable<number> {
    return this.httpClient.get(config.endpoint.raw.url + '?f=' + filter + '&c=count'
      + (flags ? '&m=' + flags : '')
      + (submitDate ? '&ts=' + submitDate : '')
      + (deliveryDate ? '&td=' + deliveryDate : '')
      + (state ? '&e=' + state : '')
      + (goodsFilter ? '&g=' + goodsFilter: ''))
    .pipe(
      map(function(response: any) {
        return response;
    }));
  }

  get(id: number): Observable<any> {
    return this.httpClient.get(config.endpoint.raw.url + '?id=' + id);
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
