import { NativeDateAdapter } from '@angular/material/core';
import { Injectable, PLATFORM_ID } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

@Injectable()
export class RuDateAdapter extends NativeDateAdapter {
  constructor() {
    super('ru-RU', new Platform(PLATFORM_ID));
  }

  getFirstDayOfWeek(): number {
    return 1;
  }
}
