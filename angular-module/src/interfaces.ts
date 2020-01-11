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
  emailtemplateid: string
  type: string;
  name: string;
  subject: string;
  slug: string;
  active: string
}

export interface IPreview {
  html: string;
  is_edited: boolean;
}


export type IParams = HttpParams | {
  [param: string]: string | string[];
};
