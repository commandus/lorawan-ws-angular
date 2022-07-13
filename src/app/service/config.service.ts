import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { ConfigNS } from '../model/configns';

@Injectable({
  providedIn: 'root'
})
export class ConfigNSService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<ConfigNS> {
    const u = config.endpoint.config.url;
    return this.httpClient.get<ConfigNS>(u);
  }
}
