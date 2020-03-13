import { Injectable } from '@angular/core';
import { IServerTemplateResponse, IMergeField } from '../interfaces';

@Injectable({
  providedIn: 'any'
})
export class AppService {
  templatesCache = new Map<string, IServerTemplateResponse>();
  activeLanguage: string;
  languages: string[];
  mergeFields: IMergeField[];
}
