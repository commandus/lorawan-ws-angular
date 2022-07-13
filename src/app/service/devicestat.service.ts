import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';
import { DeviceStat } from '../model/stat-device';

@Injectable({
  providedIn: 'root'
})
export class DeviceStatService {
  constructor(private httpClient: HttpClient) { }

  list(): Observable<DeviceStat[]> {
    const u = config.endpoint.statdevice.url;
    return this.httpClient.get<DeviceStat[]>(u).pipe(
      map(function(response: DeviceStat[]) {
        return response.sort((l, r) => {
          if (l.metadata.length > 0 && r.metadata.length > 0 )
            return l.metadata[0].time < r.metadata[0].time ? 1 : -1;
          else
            return 0;  
        });
      })
    );

  }
}
