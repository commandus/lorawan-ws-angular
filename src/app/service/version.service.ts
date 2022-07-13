import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { Version } from '../model/version';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<Version> {
    const u = config.endpoint.about.url;
    return this.httpClient.get<Version>(u);
  }
}
