import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IpEmailBuilderService,
  Structure,
  IPEmail,
  TextBlock,
} from 'ip-email-builder';
import { GlobalVariable } from '../global';
import { IPerfexEmail } from 'src/interfaces';
import { BehaviorSubject } from 'rxjs';

const { API_BASE = '/admin/email_builder/' } = GlobalVariable;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
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
    'tasks',
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
    'vietnamese',
  ];
  currentEmail = {
    type: '',
    language: 'english',
  };
  mergeFields = [];

  perfexEmail: IPerfexEmail;
  startedBuilding = new BehaviorSubject(false);

  constructor(private ngb: IpEmailBuilderService, private http: HttpClient) {}

  async getEmail() {
    if (this.currentEmail.type && this.currentEmail.language) {
      this.ngb.snackBar.open('Loading email template, please wait ...');
      const res = (await this.http
        .get(`${API_BASE}/templates`, {
          params: this.currentEmail,
          responseType: 'json',
        })
        .toPromise()) as IPerfexEmail;

      this.perfexEmail = res;
      this.mergeFields = GlobalVariable.MERGE_FIELDS.filter(
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
          new Structure('cols_1', [[new TextBlock(this.perfexEmail.message)]]),
        ],
      }
    );
    this.ngb.Template = message;
    this.ngb.Email.general.previewText = subject;
    this.ngb.MergeTags = new Set(this.mergeFields.map((tag) => tag.key));
    this.startedBuilding.next(true);
  }

  async saveEmail() {
    if (!this.ngb.hasChanges) {
      return this.ngb.snackBar.open(
        'There are not changes to be saved.',
        'Close',
        {
          duration: 3000,
        }
      );
    }

    const { email, template } = await this.ngb.saveEmail();
    const { fromname, subject, emailtemplateid } = this.perfexEmail;

    const formData = new FormData();
    formData.append(
      'csrf_token_name',
      GlobalVariable.CSRF || '06dde7a267511f223617e49d969cf386'
    );
    formData.append('fromname', fromname);
    formData.append('subject', subject);
    formData.append('emailtemplateid', emailtemplateid);
    formData.append('htmlTemplate', template);
    formData.append('emailObject', JSON.stringify(email));

    const { success } = (await this.http
      .post(`${API_BASE}/update`, formData)
      .toPromise()) as { success: boolean };

    if (success) {
      this.ngb.snackBar.open('Email template updated successfully.', 'Close', {
        duration: 3000,
      });
    }
  }
}
