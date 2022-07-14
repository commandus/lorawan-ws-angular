import { Component, OnInit } from '@angular/core';
import { EnvAppService } from '../env-app.service';
import { DeviceService } from '../service/device.service';
import { Device } from '../model/device';

@Component({
  selector: 'app-config-devices',
  templateUrl: './config-devices.component.html',
  styleUrls: ['./config-devices.component.css']
})
export class ConfigDevicesComponent implements OnInit {

  values: Device[];

  public displayedColumns: string[] = [
    'name', 'addr', 'activation', 'deviceClass', 'devEUI', 
    'version', 'appEUI', 'nwkSKey', 'appSKey',  'appKey',
    'nwkKey', 'nonce', 'joinNonce'
  ];

  constructor(
    public env: EnvAppService,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.deviceService.list().subscribe(v => {
      this.values = v;
    });
  }

}
