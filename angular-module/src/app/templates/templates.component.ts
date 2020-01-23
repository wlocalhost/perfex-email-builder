import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, of, Observable, Subject, EMPTY } from 'rxjs';
import { tap, exhaustMap, map, switchMap } from 'rxjs/operators';

import {
  ITemplate,
  IServerTemplateResponse,
  IPreview, IPerfexEmail, IPostRespose,
  ISaveDetailsResponse
} from '../../interfaces';
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
    public res: ResourceService,
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
        return this.res.getTemplatesByLang(lang).pipe(
          tap(tmpl => this.templatesCache.set(lang, tmpl)),
        );
      }
      return of(this.templatesCache.get(lang));
    }),
  );

  getTemplate$: Observable<IPEmail> = this.editTemplate$.pipe(
    switchMap(id => id || EMPTY),
    exhaustMap(id => this.res.getTemplate(id).pipe(
      tap(data => requestAnimationFrame(() => this.openSidenav$.next(!!data)))
    ))
  );

  getTemplateBody$: Observable<IPreview> = this.previewTemplate$.pipe(
    switchMap(id => id || EMPTY),
    exhaustMap(id => this.res.getTemplateBody(id).pipe(
      tap(data => requestAnimationFrame(() => this.openSidenav$.next(!!data)))
    )),
  );

  async closeSidenav() {
    let closeState = true;
    if (this.ngb.hasChanges && this.editTemplate$.getValue()) {
      closeState = await this.dialog.open(ModalDialogComponent, {
        data: { type: 'confirm' },
        width: '300px',
        maxWidth: '100%'
      })
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
      try {
        const { email, template } = await this.ngb.saveEmail();
        const formData = new FormData();
        formData.append('emailtemplateid', this.editTemplate$.getValue());
        formData.append('emailObject', JSON.stringify(email));
        formData.append('template', template);
        const update = await this.res.sendPostRequest<IPostRespose>(formData, 'update').toPromise();
        success = update.success;
      } catch (e) {
        success = false;
        console.error(e);
        this.ngb.snackBar.open('Something bad happened.', 'Close');
      }
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
      const update = await this.res
        .sendPostRequest<IPostRespose>(formData, 'changeActiveStatus').toPromise();
      if (update.success) {
        element.active = active;
      } else {
        source.toggle();
      }
    } catch {
      source.toggle();
    }
  }

  async changeElementDetails(element: IPerfexEmail) {
    const res: ISaveDetailsResponse = await this.dialog.open(ModalDialogComponent, {
      data: { type: 'edit', data: element },
      width: '350px',
      maxWidth: '100%'
    })
      .afterClosed().pipe(
        exhaustMap(form => {
          if (!form) {
            return of({ success: false });
          }
          const body = new FormData(form);
          return this.res.sendPostRequest<ISaveDetailsResponse>(body, 'updateDetails');
        })
      ).toPromise();

    if (res.success) {
      element.subject = res.updates.subject;
      element.fromname = res.updates.fromname;
      this.ngb.snackBar.open('The details have been saved.', null, { duration: 3000 });
    }
  }

  // TODO: Send test email request
  async sendTestEmail(element: IPerfexEmail) {
    console.log(element.emailtemplateid);
  }

  ngOnInit() {
    this.templatesCache.set('english', this.templates);
  }
}
