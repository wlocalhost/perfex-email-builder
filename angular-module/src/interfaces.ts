import { IPEmail } from 'ip-email-builder';

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
  type: string;
  name: string;
  subject: string;
  slug: string;
}
