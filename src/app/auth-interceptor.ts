import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { AuthenticationService } from './service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthenticationService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = '';
    if (typeof this.auth !== 'undefined') {
      token = this.auth.employee.id + ';' + this.auth.employee.token;
    }
    const request = req.clone({
      setHeaders: {
        Authentication: `${token}`
      }
    });
    return next.handle(request).pipe(
        tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            console.log('Redirect');
          }
        }
      })
    );
  }
}
