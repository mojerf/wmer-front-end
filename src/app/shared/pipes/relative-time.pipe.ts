import { Pipe, PipeTransform } from '@angular/core';

const rtf = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });
const DAY = 86_400_000;

/**
 * Persian relative time ("امروز", "۳ روز پیش", "۲ هفته پیش"). The smallest unit is a day so the text
 * stays identical between the server render and hydration in the browser.
 */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(iso: string, now: number = Date.now()): string {
    const time = Date.parse(iso);
    if (Number.isNaN(time)) {
      return '';
    }

    const days = Math.floor((now - time) / DAY);
    if (days < 7) {
      return rtf.format(-Math.max(days, 0), 'day');
    }
    if (days < 30) {
      return rtf.format(-Math.floor(days / 7), 'week');
    }
    if (days < 365) {
      return rtf.format(-Math.floor(days / 30), 'month');
    }
    return rtf.format(-Math.floor(days / 365), 'year');
  }
}
