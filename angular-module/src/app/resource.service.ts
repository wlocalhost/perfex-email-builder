import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ITemplate, IParams, IPreview, IPerfexEmail } from 'src/interfaces';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiBase: string;
  private headers: HttpHeaders;
  isLoading$ = new BehaviorSubject(false);

  constructor(private http: HttpClient) { }

  private httpGetRequest(path: string, params: IParams) {
    return this.http.get(`${this.apiBase}/${path}`, {
      headers: this.headers,
      params,
      responseType: 'json'
    }).pipe(
      tap(
        () => this.isLoading$.next(true),
        error => {
          console.error(error);
          return of([]);
        },
        () => this.isLoading$.next(false))
    );
  }

  init(apiBase: string, csrfName: string, csrfToken: string) {
    this.apiBase = environment.production ? apiBase : '/admin/perfex_email_builder';
    this.headers = new HttpHeaders({ [csrfName]: csrfToken, 'Content-Type': 'application/json' });
  }

  getTemplatesByLanguage(language: string) {
    return this.httpGetRequest('templates', { language }) as Observable<ITemplate[]>;
  }

  getTemplateBody(emailtemplateid: string) {
    return this.httpGetRequest('getEmailTemplate', { emailtemplateid }) as Observable<IPreview>;
  }

  getTemplate(emailtemplateid: string) {
    return this.httpGetRequest('getTemplate', { emailtemplateid }) as Observable<IPerfexEmail>;
  }
}
