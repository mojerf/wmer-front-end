import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';

export interface ContactMessage {
  email: string;
  phoneNumber: string;
  title: string;
  text: string;
}

/** What the contact feature needs from the outside world. */
export abstract class ContactApi {
  abstract send(message: ContactMessage): Observable<void>;
}

@Injectable()
export class HttpContactApi extends ContactApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/contacts`;

  send(message: ContactMessage): Observable<void> {
    return this.http
      .post(this.url, {
        email: message.email,
        title: message.title,
        text: message.text,
        phone_number: message.phoneNumber || null,
      })
      .pipe(map(() => undefined));
  }
}

/** Accepts every message without sending it anywhere; used while `useMockApi` is on. */
@Injectable()
export class MockContactApi extends ContactApi {
  send(): Observable<void> {
    return of(undefined);
  }
}
