import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datedow'
})

export class DateDowPipe implements PipeTransform {
  transform(value: Date): string {
    switch (value.getDay()) {
      case 0:
        return 'вс';
      case 1:
        return 'пн';
      case 2:
        return 'вт';
      case 3:
        return 'ср';
      case 4:
        return 'чт';
      case 5:
        return 'пт';
      case 6:
        return 'сб';
      default:
      return '';
    }
  }
}