import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gateway } from '../model/gateway';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class GatewaysService {

  constructor(private httpClient: HttpClient) {};

    list(ofs: number, pagesize: number): Observable<Gateway[]> {
    return this.httpClient.get<Gateway[]>(config.endpoint.gateways.url + '?o=' + ofs + '&s=' + pagesize)
      .pipe(
        map(function(response: Gateway[]) {
          return response;
      }));
    }

}
