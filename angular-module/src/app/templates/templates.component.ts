import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { filter, toArray, take } from 'rxjs/operators';
import { IpEmailBuilderService, IPEmail, Structure, TextBlock } from 'ip-email-builder';

import { IPerfexEmail, ITemplate } from '../../interfaces';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  @Input() templates: ITemplate[] = [];
  displayedColumns = ['name', 'subject', 'button'];

  types = [
    'staff',
    'credit_note',
    'subscriptions',
    'gdpr',
    'leads',
    'project',
    'proposals',
    'contract',
    'estimate',
    'invoice',
    'ticket',
    'client',
    'tasks'
  ];
  currentEmail = {
    type: '',
    language: 'english'
  };
  mergeFields = [];

  languages$ = from([
    'english',
    'bulgarian',
    'catalan',
    'chinese',
    'czech',
    'dutch',
    'french',
    'german',
    'greek',
    'indonesia',
    'italian',
    'japanese',
    'persian',
    'polish',
    'portuguese',
    'portuguese_br',
    'romanian',
    'russian',
    'slovak',
    'spanish',
    'swedish',
    'turkish',
    'vietnamese'
  ]).pipe(filter(lang => !['english', 'russian', 'french', 'german', this.currentEmail.language].includes(lang)), toArray());

  topLanguagesList$ = from(['english', 'russian', 'french', 'german', 'spanish'])
    .pipe(filter(lang => lang !== this.currentEmail.language), take(4), toArray());

  perfexEmail: IPerfexEmail = null;
  startedBuilding = new BehaviorSubject(false);

  constructor(private ngb: IpEmailBuilderService, private http: HttpClient) { }

  async getEmail() {
    if (this.currentEmail.type && this.currentEmail.language) {
      this.ngb.snackBar.open('Loading email template, please wait ...');
      const res = (await this.http
        .get(`${environment.globalVariable.API_BASE}/templates`, {
          params: this.currentEmail,
          responseType: 'json'
        })
        .toPromise()) as IPerfexEmail;

      this.perfexEmail = res;
      this.mergeFields = environment.globalVariable.MERGE_FIELDS.filter(
        (field: object) => field[this.currentEmail.type]
      )
        .flatMap((field: object) => field[this.currentEmail.type])
        .map(({ key, name }) => ({ key, name }))
        .filter(({ key, name }) => key && name);
      this.ngb.snackBar.dismiss();
    }
  }

  startBuilding() {
    const { emailObject, subject, message } = this.perfexEmail;
    this.ngb.Email = new IPEmail(
      emailObject || {
        structures: [
          new Structure('cols_1', [[new TextBlock(this.perfexEmail.message)]])
        ]
      }
    );
    this.ngb.Template = message;
    this.ngb.Email.general.previewText = subject;
    this.ngb.MergeTags = new Set(this.mergeFields.map(tag => tag.key));
    this.startedBuilding.next(true);
  }

  async saveEmail() {
    if (!this.ngb.hasChanges) {
      return this.ngb.snackBar.open(
        'There are not changes to be saved.',
        'Close',
        {
          duration: 3000
        }
      );
    }

    const { email, template } = await this.ngb.saveEmail();
    const { fromname, subject, emailtemplateid } = this.perfexEmail;

    const formData = new FormData();
    formData.append(environment.globalVariable.CSRF.name, environment.globalVariable.CSRF.token);
    formData.append('fromname', fromname);
    formData.append('subject', subject);
    formData.append('emailtemplateid', emailtemplateid);
    formData.append('htmlTemplate', template);
    formData.append('emailObject', JSON.stringify(email));

    const { success } = (await this.http
      .post(`${environment.globalVariable.API_BASE}/update`, formData)
      .toPromise()) as { success: boolean };

    if (success) {
      this.ngb.snackBar.open('Email template updated successfully.', 'Close', {
        duration: 3000
      });
    }
  }

  changeLanguage(lang: string) {
    this.currentEmail.language = lang;
  }

  chooseAnotherTemplate() {
    this.currentEmail.type = '';
    this.perfexEmail = null;
    this.mergeFields = [];
    this.startedBuilding.next(false);
  }

  getTemplatesByType(type: string) {
    return this.templates.filter(template => template.type === type);
  }

  ngOnInit() {
    console.log(this.templates);
  }

}
