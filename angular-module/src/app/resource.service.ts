import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError, Subject, of } from 'rxjs';
import { catchError, map, finalize, tap, shareReplay } from 'rxjs/operators';
import { IPEmail, Structure, TextBlock } from 'ip-email-builder';

import { IParams, IPreview, IPerfexEmail, IServerTemplateResponse, TMethod, IMergeField } from '../interfaces';

@Injectable({
  providedIn: 'any'
})
export class ResourceService {
  private _isLoading$ = new Subject();

  activeLanguage: string;
  isLoading$ = this._isLoading$.asObservable();

  constructor(private http: HttpClient, private matSnack: MatSnackBar) { }

  private httpRequest<T>(path: string, params: IParams = {}, method: TMethod = 'get', body?: FormData) {
    this._isLoading$.next(true);
    this.matSnack.open('Please wait...');
    return this.http.request<T>(method, `${globalThis.NGB.baseUrl}/${path}`, {
      params, body, responseType: 'json'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          console.error('An error occurred:', error.error.message);
        } else {
          console.error(`Backend returned code ${error.status}`);
          this.matSnack.open(
            `Something bad happened; please try again later. "Error Status ${error.status}".`,
            'Close',
            { announcementMessage: 'Something bad happened; please try again later.' });
        }
        console.error(error);
        return throwError(new Error('Something bad happened; please try again later.'));
      }),
      tap(() => this.matSnack.dismiss()),
      finalize(() => this._isLoading$.next(false)),
    );
  }

  getTemplatesByLang(language: string) {
    return this.httpRequest<IServerTemplateResponse>('templates', { language });
  }

  getTemplateBody(id: string) {
    return this.httpRequest<IPreview>('getEmailTemplate', { id });
  }

  getTemplate(id: string) {
    return this.httpRequest<{ template: IPEmail & { message: string } }>('getTemplate', { id })
  }

  revertTemplate(id: string) {
    return this.sendPostRequest(new FormData(), `revertTemplate/${id}`).pipe(
      map((res: IPerfexEmail) => {
        return {
          isEdited: false,
          email: new IPEmail({
            structures: [
              new Structure('cols_1', [[new TextBlock(res.message)]])
            ]
          })
        };
      })
    );
  }

  getAllLanguages() {
    return this.httpRequest<string[]>('languages').pipe(
      shareReplay(),
      catchError(() => {
        return of([] as string[]);
      })
    );
  }

  getAllMergeFields(type: string) {
    return this.httpRequest<IMergeField[]>('mergeFields', { type }).pipe(
      catchError(() => of([] as IMergeField[]))
    );
  }

  sendPostRequest<T>(body = new FormData(), path: string) {
    const { token, name } = globalThis.NGB.csrf;
    body.append(name, token);
    return this.httpRequest<T>(path, {}, 'post', body);
  }
}
