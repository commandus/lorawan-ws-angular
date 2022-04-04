import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvAppService {
  version = '1.0';
  constructor() { }

  public onError(error: any): void {
    console.log(error);
  }
}
