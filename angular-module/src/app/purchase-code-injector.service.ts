import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseCodeInjectorService implements HttpInterceptor {

  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith('https://ngb-api')) {
      return next.handle(req);
    } else {
      if (!globalThis.NGB.purchaseCode) {
        return throwError('No Purchase code provided')
      } else {
        return next.handle(req.clone({
          params: req.params.append('pKey', globalThis.NGB.purchaseCode)
        }))
      }
    }
  }
}
