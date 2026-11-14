import { DOCUMENT, inject, Injectable } from '@angular/core';

/** Leaves the app for another page (e.g. a payment gateway). A service so it can be replaced in tests. */
@Injectable({ providedIn: 'root' })
export class ExternalNavigation {
  private readonly doc = inject(DOCUMENT);

  go(url: string): void {
    this.doc.defaultView?.location.assign(url);
  }
}
