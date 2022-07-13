import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { GatewayStat } from '../model/stat-gw';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GatewayStatService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<GatewayStat[]> {
    const u = config.endpoint.statgw.url;
    return this.httpClient.get<GatewayStat[]>(u).pipe(
      map(function(response: GatewayStat[]) {
        return response.sort((l, r) =>{
          return l.time < r.time ? 1 : -1;
        });
      })
    );
  }
}
