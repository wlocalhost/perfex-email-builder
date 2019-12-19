import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IpEmailBuilderService, IPEmail, Structure, TextBlock } from 'ip-email-builder';

import { IPerfexEmail } from '../../interfaces';
import { environment } from '../../environments/environment';

const ELEMENT_DATA = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent {
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
  languages = [
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
  ];
  currentEmail = {
    type: '',
    language: 'english'
  };
  mergeFields = [];

  perfexEmail: IPerfexEmail = null;
  startedBuilding = new BehaviorSubject(false);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

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

  chooseAnotherTemplate() {
    this.currentEmail.type = '';
    this.perfexEmail = null;
    this.mergeFields = [];
    this.startedBuilding.next(false);
  }

}
