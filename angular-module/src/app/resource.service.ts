import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError, Observable, empty } from 'rxjs';
import { IParams, IPreview, IPerfexEmail, IServerTemplateResponse } from 'src/interfaces';
import { catchError, map, finalize, distinctUntilChanged, exhaustMap, exhaust } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { IPEmail, Structure, TextBlock } from 'ip-email-builder';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiBase: string;
  private headers: HttpHeaders;
  isLoading$ = new BehaviorSubject(false);

  constructor(private http: HttpClient, private matSnack: MatSnackBar) { }

  private httpGetRequest<T>(path: string, params: IParams) {
    this.isLoading$.next(true);
    return this.http.get<T>(`${this.apiBase}/${path}`, {
      headers: this.headers,
      params,
      responseType: 'json'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          console.error('An error occurred:', error.error.message);
        } else {
          console.error(`Backend returned code ${error.status}`);
          this.matSnack.open(
            // tslint:disable-next-line: max-line-length
            `Something bad happened; please try again later. If error persist, contact me at support@wlocalhost.org and include this message "Error Status ${error.status}".`,
            'Close',
            { announcementMessage: 'Something bad happened; please try again later.' });
        }
        return throwError('Something bad happened; please try again later.');
      }),
      finalize(() => this.isLoading$.next(false)),
    );
  }

  init(apiBase: string, csrfName: string, csrfToken: string) {
    this.apiBase = environment.production ? apiBase : '/admin/perfex_email_builder';
    this.headers = new HttpHeaders({ [csrfName]: csrfToken, 'Content-Type': 'application/json' });
  }

  getTemplatesByLang(language: string) {
    return this.httpGetRequest<IServerTemplateResponse>('templates', { language });
  }

  getTemplateBody(emailtemplateid: string) {
    return this.httpGetRequest<IPreview>('getEmailTemplate', { emailtemplateid });
  }

  getTemplate(emailtemplateid: string) {
    return this.httpGetRequest('getTemplate', { emailtemplateid }).pipe(
      map((res: IPerfexEmail) => {
        return new IPEmail(res.emailObject || {
          structures: [
            new Structure('cols_1', [[new TextBlock(res.message)]])
          ],
          // general: {
          //   previewText: 'dsd'
          // }
        });
      })
    );
  }
}
