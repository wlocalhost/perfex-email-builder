import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { ITemplate, IParams, IPreview, IPerfexEmail } from 'src/interfaces';
import { catchError, map, finalize, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { IPEmail, Structure, TextBlock } from 'ip-email-builder';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiBase: string;
  private headers: HttpHeaders;
  isLoading$ = new BehaviorSubject(false);

  constructor(private http: HttpClient) {}

  private httpGetRequest<T>(path: string, params: IParams) {
    this.isLoading$.next(true);
    return this.http.get<T>(`${this.apiBase}/${path}`, {
      headers: this.headers,
      params,
      responseType: 'json'
    }).pipe(
      distinctUntilChanged(),
      catchError(error => {
        console.error(error);
        return throwError(error);
      }),
      finalize(() => this.isLoading$.next(false)),
    );
  }

  init(apiBase: string, csrfName: string, csrfToken: string) {
    this.apiBase = environment.production ? apiBase : '/admin/perfex_email_builder';
    this.headers = new HttpHeaders({ [csrfName]: csrfToken, 'Content-Type': 'application/json' });
  }

  getTemplatesByLang(language: string) {
    return this.httpGetRequest<ITemplate[]>('templates', { language });
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
