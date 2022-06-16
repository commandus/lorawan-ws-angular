import { Injectable } from '@angular/core';
import { ElementRef } from '@angular/core';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EnvAppService {
  
  version = '1.0';
  
  constructor(private router: Router) {

  }

  public menu: string;
  private _darkMode: boolean;
  
  public onError(error: any): void {
    console.log(error);
  }

  public parseDate(e: ElementRef) : Date {
    const parts = e.nativeElement.value.split(".");
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
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

}
