import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('fa-IR');

/** Formats a number with Persian digits and grouping, e.g. 490000 -> ۴۹۰٬۰۰۰ */
@Pipe({ name: 'faNumber' })
export class FaNumberPipe implements PipeTransform {
  transform(value: number): string {
    return formatter.format(value);
  }
}
