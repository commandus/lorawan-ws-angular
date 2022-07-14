import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { RegionBand, RegionParameters } from '../model/plan';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<RegionBand[]> {
    const u = config.endpoint.plan.url;
    return this.httpClient.get<RegionParameters>(u).pipe(
      map((response: RegionParameters) => {
          return response.RegionBands;
      })
    );
  }
}
