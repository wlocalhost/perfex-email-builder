import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { tap, exhaustMap } from 'rxjs/operators';
import { IpEmailBuilderService } from 'ip-email-builder';

import { ITemplate, ISidenavData, IServerTemplateResponse } from '../../interfaces';
import { ResourceService } from '../resource.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {
  @Input() private templates: IServerTemplateResponse;
  @Input() latest: ITemplate[];
  @Input() languages: string[];
  private templatesCache = new Map<string, IServerTemplateResponse>();

  displayedColumns = ['name', 'subject', 'button'];
  showInSidenav$ = new BehaviorSubject<ISidenavData>(null);
  activeLanguage$ = new BehaviorSubject('english');

  // Create observables for resources
  getTemplates$: Observable<IServerTemplateResponse> = this.activeLanguage$.pipe(
    exhaustMap(lang => {
      if (!this.templatesCache.has(lang)) {
        return this.resourceService.getTemplatesByLang(lang).pipe(
          tap(tmpl => this.templatesCache.set(lang, tmpl)),
        );
      }
      return of(this.templatesCache.get(lang));
    })
  );

  constructor(
    private ngb: IpEmailBuilderService,
    public resourceService: ResourceService) {
  }

  async getTemplateBody(emailtemplateid: string) {
    const data = await this.resourceService.getTemplateBody(emailtemplateid).toPromise();
    requestAnimationFrame(() => {
      this.showInSidenav$.next({ data, type: 'preview' });
    });
  }

  async editTemplate(emailtemplateid: string) {
    this.ngb.Email = await this.resourceService.getTemplate(emailtemplateid).toPromise();
    requestAnimationFrame(() => {
      this.showInSidenav$.next({ type: 'builder' });
    });
  }

  expansionPanelOpen(key?: string) {
    if (key) {
      localStorage.setItem('expansionPanelOpened', key);
    }
    return localStorage.getItem('expansionPanelOpened') || 'client';
  }

  // async getEmail() {
  //   if (this.currentEmail.type && this.currentEmail.language) {
  //     this.ngb.snackBar.open('Loading email template, please wait ...');
  //     const res = (await this.http
  //       .get(`${environment.globalVariable.API_BASE}/templates`, {
  //         params: this.currentEmail,
  //         responseType: 'json'
  //       })
  //       .toPromise()) as IPerfexEmail;

  //     this.perfexEmail = res;
  //     this.mergeFields = environment.globalVariable.MERGE_FIELDS.filter(
  //       (field: object) => field[this.currentEmail.type]
  //     )
  //       .flatMap((field: object) => field[this.currentEmail.type])
  //       .map(({ key, name }) => ({ key, name }))
  //       .filter(({ key, name }) => key && name);
  //     this.ngb.snackBar.dismiss();
  //   }
  // }

  // startBuilding() {
  //   const { emailObject, subject, message } = this.perfexEmail;
  //   this.ngb.Email = new IPEmail(
  //     emailObject || {
  //       structures: [
  //         new Structure('cols_1', [[new TextBlock(this.perfexEmail.message)]])
  //       ]
  //     }
  //   );
  //   this.ngb.Template = message;
  //   this.ngb.Email.general.previewText = subject;
  //   this.ngb.MergeTags = new Set(this.mergeFields.map(tag => tag.key));
  //   this.startedBuilding.next(true);
  // }

  // async saveEmail() {
  //   if (!this.ngb.hasChanges) {
  //     return this.ngb.snackBar.open(
  //       'There are not changes to be saved.',
  //       'Close',
  //       {
  //         duration: 3000
  //       }
  //     );
  //   }

  //   const { email, template } = await this.ngb.saveEmail();
  //   const { fromname, subject, emailtemplateid } = this.perfexEmail;

  //   const formData = new FormData();
  //   formData.append(environment.globalVariable.CSRF.name, environment.globalVariable.CSRF.token);
  //   formData.append('fromname', fromname);
  //   formData.append('subject', subject);
  //   formData.append('emailtemplateid', emailtemplateid);
  //   formData.append('htmlTemplate', template);
  //   formData.append('emailObject', JSON.stringify(email));

  //   const { success } = (await this.http
  //     .post(`${environment.globalVariable.API_BASE}/update`, formData)
  //     .toPromise()) as { success: boolean };

  //   if (success) {
  //     this.ngb.snackBar.open('Email template updated successfully.', 'Close', {
  //       duration: 3000
  //     });
  //   }
  // }

  ngOnInit() {
    this.templatesCache.set('english', this.templates);
  }
}
