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

  parse(value: any): Date | null {
    if ((typeof value === 'string') && (value.indexOf('.') > -1)) {
        const str = value.split('.');
        return new Date(Number(str[2]), Number(str[1]) - 1, Number(str[0]));
    }
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
}

  format(date: Date, displayFormat: Object): string {
      return date.getDate().toString().padStart(2, '0')
        + "." + (date.getMonth() + 1).toString().padStart(2, '0')
        + '.' + date.getFullYear();
  }
}
