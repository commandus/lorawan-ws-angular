import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Employee } from '../model/employee';

import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private httpClient: HttpClient) { }

  token(value: Employee): Observable<string> {
    const u = config.endpoint.token.url + '?user=' + value.login + '&password=' + value.password;
    return this.httpClient.get(u, { responseType: 'text'});
  }
}
