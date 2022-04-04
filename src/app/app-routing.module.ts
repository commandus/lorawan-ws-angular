import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RawComponent } from './raw/raw.component';
import { TemperatureComponent } from './temperature/temperature.component';

const routes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'raw', component: RawComponent},
  { path: 'raw/:id', component: RawComponent},
  { path: 't', component: TemperatureComponent},
  { path: 't/:id', component: TemperatureComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
