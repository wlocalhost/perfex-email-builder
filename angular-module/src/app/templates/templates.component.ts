import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { tap, exhaustMap, map } from 'rxjs/operators';

import { ITemplate, IServerTemplateResponse, IPreview, IPerfexEmail } from '../../interfaces';
import { ResourceService } from '../resource.service';
import { IPEmail, IpEmailBuilderService } from 'ip-email-builder';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {
  constructor(
    public resourceService: ResourceService,
    private ngb: IpEmailBuilderService,
    private dialog: MatDialog
  ) { }

  @Input() private templates: IServerTemplateResponse;
  @Input() latest: ITemplate[];
  @Input() languages: string[];
  private templatesCache = new Map<string, IServerTemplateResponse>();

  displayedColumns = ['active', 'name', 'subject', 'actions'];
  activeLanguage$ = new BehaviorSubject('english');

  previewTemplate$ = new BehaviorSubject<string>(null);
  editTemplate$ = new BehaviorSubject<string>(null);
  openSidenav$ = new Subject<boolean>();

  // Create observables for resources
  getTemplates$: Observable<IServerTemplateResponse> = this.activeLanguage$.pipe(
    exhaustMap(lang => {
      if (!this.templatesCache.has(lang)) {
        return this.resourceService.getTemplatesByLang(lang).pipe(
          tap(tmpl => this.templatesCache.set(lang, tmpl)),
        );
      }
      return of(this.templatesCache.get(lang));
    }),
  );

  getTemplate$: Observable<IPEmail> = this.editTemplate$.pipe(
    exhaustMap(emailtemplateid =>
      emailtemplateid ? this.resourceService.getTemplate(emailtemplateid).pipe(
        tap(data => this.openSidenav$.next(!!data))
      ) : of(null))
  );

  getTemplateBody$: Observable<IPreview> = this.previewTemplate$.pipe(
    exhaustMap(emailtemplateid =>
      emailtemplateid ? this.resourceService.getTemplateBody(emailtemplateid).pipe(
        tap(data => this.openSidenav$.next(!!data))
      ) : of(null)),
  );

  async closeSidenav() {
    let closeState = true;
    if (this.ngb.hasChanges && this.editTemplate$.getValue()) {
      closeState = await this.dialog.open(ModalDialogComponent)
        .afterClosed().pipe(map(Boolean)).toPromise();
    }
    if (closeState) { this.editTemplate$.next(null); }
    this.previewTemplate$.next(null);
    this.openSidenav$.next(!closeState);
  }

  expansionPanelOpen(key?: string) {
    if (key) {
      localStorage.setItem('expansionPanelOpened', key);
    }
    return localStorage.getItem('expansionPanelOpened') || 'client';
  }

  async saveEmail(closeSidenav: true) {
    let success = true;
    if (this.ngb.hasChanges) {
      const { email, template } = await this.ngb.saveEmail();
      const formData = new FormData();
      formData.append('emailtemplateid', this.editTemplate$.getValue());
      formData.append('emailObject', JSON.stringify(email));
      formData.append('template', template);
      success = await this.resourceService.sendPostRequest(formData, 'update').toPromise();
    }
    if (closeSidenav && success) {
      await this.closeSidenav();
    }
    if (success) {
      this.ngb.snackBar.open('Email template successfully saved.', 'Close', {
        duration: 3000
      });
    }
  }

  async changeActiveStatus({ checked, source }: MatSlideToggleChange, element: IPerfexEmail) {
    const active = checked ? '1' : '0';
    const formData = new FormData();
    formData.append('emailtemplateid', element.emailtemplateid);
    formData.append('active', active);
    try {
      const update: any = await this.resourceService.sendPostRequest(formData, 'changeActiveStatus').toPromise();
      if (update.success) {
        element.active = active;
      } else {
        source.toggle();
      }
    } catch {
      source.toggle();
    }
  }

  // TODO: Change and save element details
  async changeElementDetails(element: IPerfexEmail) {
    console.log(element.emailtemplateid);
  }

  // TODO: Send test email request
  async sendTestEmail(element: IPerfexEmail) {
    console.log(element.emailtemplateid);
  }

  ngOnInit() {
    this.templatesCache.set('english', this.templates);
  }
}
