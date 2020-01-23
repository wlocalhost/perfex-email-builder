import { IPEmail } from 'ip-email-builder';
import { HttpParams } from '@angular/common/http';

export interface IPerfexEmail {
  active: string;
  emailObject: IPEmail;
  emailtemplateid: string;
  fromemail: string;
  fromname: string;
  language: string;
  message: string;
  name: string;
  order: string;
  plaintext: string;
  slug: string;
  subject: string;
  type: string;
}

export interface ITemplate {
  emailtemplateid: string;
  // type: string;
  name: string;
  subject: string;
  fromname: string;
  // slug: string;
  active: string;
}

export interface IServerTemplateResponse {
  [key: string]: ITemplate[];
}

export interface IPreview {
  html: string;
  is_edited: boolean;
}

export interface IObject {
  [param: string]: string | string[];
}

export type IParams = HttpParams | IObject;

export interface ISidenavData {
  emailtemplateid: string;
  type: 'preview' | 'builder';
}

export type TMethod = 'get' | 'post' | 'put';
export interface IPostRespose {
  success: boolean;
}

export interface ISaveDetailsResponse {
  success: boolean;
  updates?: IPerfexEmail;
}

export interface IDialogData {
  type: 'confirm' | 'edit' | 'test-email';
  data?: IObject;
}
