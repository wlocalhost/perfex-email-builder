import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ITemplate, IParams } from 'src/interfaces';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiBase: string;
  private headers: HttpHeaders;

  constructor(private http: HttpClient) { }

  private httpGetRequest(path: string, params: IParams) {
    return this.http.get(`${this.apiBase}/${path}`, { headers: this.headers, params, responseType: 'json' }).pipe(
      catchError(error => {
        console.error(error);
        return of([]);
      })
    );
  }

  init(apiBase: string, csrfName: string, csrfToken: string) {
    this.apiBase = environment.production ? apiBase : '/admin/perfex_email_builder';
    this.headers = new HttpHeaders({ [csrfName]: csrfToken, 'Content-Type': 'application/json' });
  }

  getTemplatesByLanguage(lang: string) {
    return this.httpGetRequest('templates', { lang }) as Observable<ITemplate[]>;
  }

  getTemplateBody(templateid: string) {
    return this.httpGetRequest('template-body', { templateid }) as Observable<ITemplate>;
  }
}
