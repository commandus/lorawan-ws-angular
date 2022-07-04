import { Injectable } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Settings } from './model/settings';

import * as L from 'leaflet';
import { Passport } from './model/passport';
import { StartFinish } from './model/startfinish';
import { formatDate } from '@angular/common';
import { TemperatureRecord } from './model/temperaturerecord';
import { TemperatureSheet } from './model/temperature-sheet';

const attrOSM = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const attrGoogle = '&copy; <a href="https://maps.google.com/">Google</a>';
const attrYandex = '&copy; <a href="https://yandex.net/">Yandex</a>';

@Injectable({
  providedIn: 'root'
})
export class EnvAppService {
  
  public MIME_CSV = 'text/csv;charset=UTF-8';
  public MIME_XSLX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  public version = '1.0';
  public map: any;
  public settings: Settings;

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
  
  constructor(private router: Router) {
    this.settings = new Settings(localStorage.getItem('settings'));
  }

  public menu: string;
  private _darkMode: boolean;

  public today(): number {
    let d = new Date();
    d.setHours(0,0,0,0);
    return d.getTime() / 1000;
  }

  public onError(error: any): void {
    console.log(error);
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
