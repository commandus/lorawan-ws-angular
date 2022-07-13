import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigDbsComponent } from './config-dbs/config-dbs.component';
import { ConfigDevicesComponent } from './config-devices/config-devices.component';
import { ConfigNsComponent } from './config-ns/config-ns.component';
import { ConfigPlansComponent } from './config-plans/config-plans.component';
import { StatDeviceComponent } from './stat-device/stat-device.component';
import { StatGatewayComponent } from './stat-gateway/stat-gateway.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MapGwComponent } from './map-gw/map-gw.component';
import { PassportListComponent } from './passport-list/passport-list.component';
import { PlumeSensorComponent } from './plume-sensor/plume-sensor.component';
import { PlumeTComponent } from './plume-t/plume-t.component';
import { RawComponent } from './raw/raw.component';
import { TemperatureComponent } from './temperature/temperature.component';

const routes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'raw', component: RawComponent},
  { path: 'raw/:id', component: RawComponent},
  { path: 't', component: TemperatureComponent},
  { path: 't/:year/:plume', component: PlumeTComponent},
  { path: 'map-gw', component: MapGwComponent},
  { path: 'passport', component: PassportListComponent},
  { path: 'plume-sensor/:year/:plume', component: PlumeSensorComponent},
  { path: 'config', component: ConfigNsComponent},
  { path: 'devices', component: ConfigDevicesComponent},
  { path: 'plans', component: ConfigPlansComponent},
  { path: 'dbs', component: ConfigDbsComponent},
  { path: 'gwstat', component: StatGatewayComponent},  
  { path: 'devicestat', component: StatDeviceComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
