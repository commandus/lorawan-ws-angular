import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { Dbs } from '../model/dbs';

@Injectable({
  providedIn: 'root'
})
export class DbsService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<Dbs[]> {
    const u = config.endpoint.dbs.url;
    return this.httpClient.get<Dbs[]>(u);
  }
}
