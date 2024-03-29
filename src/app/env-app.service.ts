import { Injectable } from '@angular/core';
import { ElementRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as L from 'leaflet';

import { Passport } from './model/passport';
import { StartFinish } from './model/startfinish';
import { Settings } from './model/settings';
import { Employee } from './model/employee';
import { Reload } from './model/reload';

import { TemperatureRecord } from './model/temperaturerecord';
import { TemperatureSheet } from './model/temperature-sheet';
import { DialogSheetFormatComponent } from './dialog-sheet-format/dialog-sheet-format.component';
import { DialogLoginComponent } from './dialog-login/dialog-login.component';
import { AuthenticationService } from './service/authentication.service';

const attrOSM = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const attrGoogle = '&copy; <a href="https://maps.google.com/">Google</a>';
const attrYandex = '&copy; <a href="https://yandex.net/">Yandex</a>';

@Injectable({
  providedIn: 'root'
})
export class EnvAppService {
  
  
  public MIME_CSV = 'text/csv;charset=UTF-8';
  public MIME_XSLX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  public version = '1.1';
  public map: any;
  public settings: Settings;
  employee: Employee;

  public hasAccount(): boolean {
    return this.employee && (this.employee.token.length > 0);
  }

  private tiles = [
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: attrOSM}),
    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: attrGoogle}),
    L.tileLayer('http://core-sat.maps.yandex.net/tiles?l=sat&z={z}&x={x}&y={y}&scale=2&lang=ru_RU', {
      maxZoom: 20, attribution: attrYandex})
  ];

  private extraTiles = [
    L.tileLayer('http://vec{s}.maps.yandex.net/tiles?l=skl&z={z}&x={x}&y={y}&scale=2&lang=ru_RU', {
      maxZoom: 20, subdomains: ['01', '02', '03', '04'], attribution: attrYandex}),
  ];

  private tileNames = [
    'OSM',
    'Gооgle',
    'Yandex'
  ];
  
  constructor(
    private router: Router, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authenticationService: AuthenticationService
  ) {
    this.settings = new Settings(localStorage.getItem('settings'));
    this.employee = new Employee(localStorage.getItem('employee'));
  }

  public menu: string;
  private _darkMode: boolean;

  public today(): number {
    let d = new Date();
    d.setHours(0,0,0,0);
    return d.getTime() / 1000;
  }
  
  public login(self?: Reload) {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      title: 'Введите логин и пароль',
      message: 'для входа',
      employee: this.employee
    };
    const dialogRef = this.dialog.open(DialogLoginComponent, d);
    dialogRef.componentInstance.logged.subscribe((value: Employee) => {

      if (value.token && value.token.length) {
        this.employee = value;
        localStorage.setItem('employee', JSON.stringify(this.employee));
        this.settings.save();
        this.authenticationService.load();
        if (self)
          self.load();
      } else {
        this.logout(self);
        this.authenticationService.load();
      }
    });
  }

  public logout(self?: Reload) {
    this.employee.logout();
    this.authenticationService.load();
    if (self)
      self.load();
  }

  public onError(error: any, self?: Reload): void 
  {
    const code = error.status;

    const actionName = 'Повторить';
    let description : string;
    if (code == 401)
        description = 'Требуется авторизация';
    else        
        description = 'Сервис временно недоступен';

    let snackBarRef = this.snackBar.open(description, actionName);
    if (self) {
      snackBarRef.onAction().subscribe(() => {
        if (code == 401)
          this.login(self);
        else
          self.load();
      });
    }
  }

  public parseDate(e: ElementRef): Date {
    const parts = e.nativeElement.value.split(".");
    if (parts.length >= 3)
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    return new Date();
  }

  public hasDate(e: ElementRef): boolean {
    const parts = e.nativeElement.value.split(".");
    return (parts.length >= 3);
  }

  public selectSheetType(): void {
    const d = new MatDialogConfig();
    d.autoFocus = true;
    d.data = {
      title: 'Выберите формат',
      message: 'электронной таблицы',
      sheetType: this.settings.sheetType
    };
    const dialogRef = this.dialog.open(DialogSheetFormatComponent, d);
    dialogRef.componentInstance.selected.subscribe((value) => {
      this.settings.sheetType = value;
      this.settings.save();
    });
  }

  public filterExtract(kosaYearPrefix: string) {
    let year = 0;
    let kosa = 0;
    if (kosaYearPrefix.length) {
      const parts = kosaYearPrefix.split("-");
      if (parts.length) {
        if (parts.length >= 2) {
          if (parts[0].length)
            year = parseInt(parts[0]);
          if (parts[1].length)
             kosa = parseInt(parts[1]);
        } else {
          if (parts[0].length)
            year = parseInt(parts[0]);
        }
      }
    }
    return [year, kosa] as const;
  }

  public getSheetHeading(): string[][] {
      return [['№', 'Коса', 'Год', '№ пакета', 'Время измерения', 'Время записи', 'Vcc', 'Vbat', 'Пакет(ы)', 'Устройство', 'Адрес', 'Время получения']];
  }

  public getSheetFileName(startFinish: StartFinish): string {
      const d1 = new Date(startFinish.start * 1000);
      const d2 = new Date(startFinish.finish * 1000);
      return formatDate(d1, 'dd.MM.yy', 'en-US') + '-' + formatDate(d2, 'dd.MM.yy', 'en-US');
  }

  public tRecords2rows(value: TemperatureRecord[]) : TemperatureSheet[] {
    let rows = new Array<TemperatureSheet>();
    value.forEach(row => {
      rows.push(new TemperatureSheet(row));
    })
    return rows;
  }

  showDashboard(): void {
    this.router.navigateByUrl('/');
    this.menu = '';
  }

  showTemperature(): void {
    this.router.navigateByUrl('/t');
    this.menu = 't';
  }
  
  showRaw(): void {
    this.router.navigateByUrl('/raw');
    this.menu = 'raw';
  }

  showMapGw(): void {
    this.router.navigateByUrl('/map-gw');
    this.menu = 'map-gw';
  }

  showPassportList(): void {
    this.router.navigateByUrl('/passport');
    this.menu = 'passport';
  }

  showPlumeT(v: Passport): void {
    this.router.navigateByUrl('/t/' + v.id.year + '/' + v.id.plume);
    this.menu = 'plume-t';
  }

  showPlumeT2(year: number, plume: number): void {
    this.router.navigateByUrl('/t/' + year + '/' + plume);
    this.menu = 'plume-t';
  }

  showPlumeSensors(v: Passport): void {
    this.router.navigateByUrl('/plume-sensor/' + v.id.year + '/' + v.id.plume);
    this.menu = 'plume-sensor';
  }

  showConfig(): void {
    this.router.navigateByUrl('/config');
    this.menu = '';
  }

  showDevices(): void {
    this.router.navigateByUrl('/devices');
    this.menu = '';
  }

  showPlans(): void {
    this.router.navigateByUrl('/plans');
    this.menu = '';
  }

  showDbs(): void {
    this.router.navigateByUrl('/dbs');
    this.menu = '';
  }
  
  showStatDevice(): void {
    this.router.navigateByUrl('/devicestat');
    this.menu = '';
  }
  
  showStatGateway(): void {
    this.router.navigateByUrl('/gwstat');
    this.menu = '';
  }
  
  public menuColor(menuName: string): string {
    if (menuName == this.menu)
      return 'primary';
    return '';  
  }

  get darkMode(): boolean {
    return this._darkMode;
  }

  set darkMode(value: boolean) {
    this._darkMode = value;
  }

  getLastLon(): number {
    let r = 129.72883;
    if (this.settings) {
      if (Array.isArray(this.settings.last)) {
        r = this.settings.last[0];
      }
    }
    return r;

  }
  getLastLat(): number {
    let r = 62.02774;
    if (this.settings) {
      if (Array.isArray(this.settings.last)) {
        r = this.settings.last[1];
      }
    }
    return r;
  }

  public destroyMap(): void {
    if (this.map) {
      this.map.eachLayer((layer: L.Layer) => {
          layer.remove();
      });
      this.map.remove();
      this.map = null;
    }
  }

  public initMap(): void {
    this.map = L.map('map', {
      center: [ this.getLastLon(), this.getLastLat() ],
      zoom: 15
    });
    L.control.scale({imperial:false, position: 'topleft'}).addTo(this.map);
    this.map.whenReady(this.onMapReady);
    this.setDefaultMapType();
  }

  private onMapReady(map: any): any {
  }

  public checkProjection(): void {
    if (!this.map)
      return;
    if (this.settings.mapType === 2) {
      this.map.options.crs = L.CRS.EPSG3395;
    } else {
      this.map.options.crs = L.CRS.EPSG3857;
    }
    this.tiles[this.settings.mapType].addTo(this.map);
    if (this.settings.mapType === 2) {
      this.extraTiles[0].addTo(this.map);
    }
}

  public toogleMapType(): void {
    try {
      const map = this.map;
      this.map.eachLayer(function (layer: any) {
        if (layer._tiles) {
          map.removeLayer(layer);
        }
      });
    } catch (e) {
      console.error(e);
    }
    this.settings.mapType++;
    if ((this.settings.mapType >= this.tiles.length) || this.settings.mapType < 0) {
      this.settings.mapType = 0;
    }
    this.settings.save();
    this.checkProjection();
  }

  public tileName(): string {
    return this.tileNames[this.settings.mapType];
  }

  public setDefaultMapType(): void {
    if (this.map) {
      this.tiles[this.settings.mapType].addTo(this.map);
      this.checkProjection();
    }
  }

  public addMarker(map: L.Map, lat: number, lon: number, title: string, caption: string): void {
    const c = new L.LatLng(lat, lon);
    console.log(c.toString());
      const marker = L.marker(c);
        marker.bindPopup(
          `<div>${title}</div><div>${caption}</div>`
        );
        marker.addTo(map);
        map.setView(c, 15);
      }

}
