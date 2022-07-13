import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { Plan } from '../model/plan';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<Plan> {
    const u = config.endpoint.plan.url;
    return this.httpClient.get<Plan>(u);
  }
}
