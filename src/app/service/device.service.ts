import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { Device } from '../model/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<Device[]> {
    const u = config.endpoint.plan.url;
    return this.httpClient.get<Device[]>(u);
  }
}
