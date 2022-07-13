import { Component, OnInit } from '@angular/core';

import { EnvAppService } from '../env-app.service';
import { DeviceStatService } from '../service/devicestat.service';
import { DeviceStat } from '../model/stat-device';

@Component({
  selector: 'app-stat-device',
  templateUrl: './stat-device.component.html',
  styleUrls: ['./stat-device.component.css']
})
export class StatDeviceComponent implements OnInit {

  values: DeviceStat[];

  public displayedColumns: string[] = [
    'addr', 'payload_size', 'payload'
  ];

  constructor(
    public env: EnvAppService,
    private deviceStatService: DeviceStatService,

  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.deviceStatService.list().subscribe(v => {
      this.values = v;
    });
  }

}
