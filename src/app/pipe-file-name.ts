import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filename'
})

export class FileNamePipe implements PipeTransform {
  transform(value: string): string {
    let p = value.lastIndexOf('/');
    if (p == value.length)
      p = value.lastIndexOf('\\');
    if (p == value.length)
      p = -1;
    return value.substring(p + 1);
  }
}