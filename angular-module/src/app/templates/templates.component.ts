import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, of, Observable, Subject, fromEvent, EMPTY } from 'rxjs';
import { tap, exhaustMap, map, takeUntil, shareReplay } from 'rxjs/operators';
import { IPEmail, IpEmailBuilderService } from 'ip-email-builder';

import {
  IServerTemplateResponse,
  IPreview, IPerfexEmail, IPostRespose,
  ISaveDetailsResponse
} from '../../interfaces';
import { ResourceService } from '../resource.service';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { AppService } from '../app.service';

interface IEditTemplate { id: string; type: string; name: string; email?: IPEmail; isEdited?: boolean; }

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<boolean>();

  constructor(
    public res: ResourceService,
    private ngb: IpEmailBuilderService,
    public app: AppService,
    private dialog: MatDialog
  ) { }

  displayedColumns = ['active', 'name', 'subject', 'actions'];
  activeLanguage$ = new BehaviorSubject<string>(null);
  getActiveLanguage$ = this.activeLanguage$.pipe(
    map(lang => lang || this.app.activeLanguage),
    takeUntil(this.onDestroy$),
  );
  previewTemplate$ = new BehaviorSubject<{ id: string, name: string }>(null);
  editTemplate$ = new BehaviorSubject<IEditTemplate>(null);
  openSidenav$ = new Subject<boolean>();

  // Create observables for resources
  getTemplates$: Observable<IServerTemplateResponse> = this.getActiveLanguage$.pipe(
    exhaustMap(lang => {
      if (!this.app.templatesCache.has(lang)) {
        return this.res.getTemplatesByLang(lang).pipe(
          tap(tmpl => this.app.templatesCache.set(lang, tmpl)),
        );
      }
      return of(this.app.templatesCache.get(lang));
    }),
    takeUntil(this.onDestroy$),
  );

  getTemplate$: Observable<IEditTemplate> = this.editTemplate$.pipe(
    exhaustMap(em => {
      if (!em) { return of(null); }
      if (em.email) { return of(em); }
      return this.res.getTemplate(em.id).pipe(map(email => ({ ...em, ...email })));
    }),
    tap(em => {
      if (em) {
        this.ngb.MergeTags = new Set([...this.app.mergeFields
          .filter(({ type }) => type === em.type)
          .map(({ key }) => key)
        ]);
      }
    }),
    tap(() => this.ngb.previewTemplate.next(null)),
    tap(data => requestAnimationFrame(() => this.openSidenav$.next(!!data))),
    takeUntil(this.onDestroy$),
  );

  getTemplateBody$: Observable<IPreview> = this.previewTemplate$.pipe(
    exhaustMap(em => em && this.res.getTemplateBody(em.id).pipe(
      map(data => ({ ...data, ...em })),
      tap(data => requestAnimationFrame(() => this.openSidenav$.next(!!data)))
    ) || of(null)),
    takeUntil(this.onDestroy$),
  );

  async closeSidenav(askAboutChanges = true) {
    let closeState = true;
    if (askAboutChanges && this.ngb.hasChanges && this.editTemplate$.getValue()) {
      closeState = await this.dialog.open(ModalDialogComponent, {
        data: { type: 'confirm' },
        width: '300px',
        maxWidth: '100%'
      })
        .afterClosed().pipe(map(Boolean)).toPromise();
    }
    if (closeState) { this.editTemplate$.next(null); }
    this.previewTemplate$.next(null);
    requestAnimationFrame(() => this.openSidenav$.next(!closeState));
  }

  async openBuilderFromPreview({ id, type, name }: IPreview) {
    this.previewTemplate$.next(null);
    await this.closeSidenav();
    requestAnimationFrame(() => this.editTemplate$.next({ id, type, name }));
  }

  expansionPanelOpen(key?: string) {
    if (key) {
      localStorage.setItem('expansionPanelOpened', key);
    }
    return localStorage.getItem('expansionPanelOpened') || 'client';
  }

  async saveEmail(data: IEditTemplate, closeSidenav = false) {
    let success = true;
    if (this.ngb.hasChanges) {
      try {
        const { email, template } = await this.ngb.saveEmail();
        const formData = new FormData();
        formData.append('emailtemplateid', this.editTemplate$.getValue().id);
        formData.append('emailObject', JSON.stringify(email));
        formData.append('template', template);
        const update = await this.res.sendPostRequest<IPostRespose>(formData, 'update').toPromise();
        success = update.success;
        data.isEdited = true;
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
      this.ngb.snackBar.open('Email template has been saved successfully.', null, {
        duration: 3000
      });
    }
  }

  async changeActiveStatus({ checked, source }: MatSlideToggleChange, element: IPerfexEmail) {
    const active = checked ? 1 : 0;
    const formData = new FormData();
    formData.append('emailtemplateid', element.emailtemplateid);
    formData.append('active', String(active));
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

  async changeElementDetails(element: IPerfexEmail, type: string) {
    const res: ISaveDetailsResponse = await this.dialog.open(ModalDialogComponent, {
      data: {
        type: 'edit',
        data: element,
        mergeFields: this.app.mergeFields.filter(_ => type === _.type)
      },
      width: '450px',
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

  async revertTemplateBack(isEdited: boolean) {
    if (!isEdited) {
      this.ngb.snackBar.open('You can\'t revert this tempalte, as it\'s already reverted.', null,
        { duration: 3000 });
    } else {
      const currentEmail = this.editTemplate$.getValue();
      this.dialog.open(ModalDialogComponent, {
        data: { type: 'confirm-revert' },
        width: '300px',
        maxWidth: '100%'
      })
        .afterClosed().pipe(
          map(Boolean),
          exhaustMap(state => {
            return state && this.res.revertTemplate(currentEmail.id) || EMPTY;
          }),
          // tap(email => requestAnimationFrame(() => this.openSidenav$.next(!!email))),
          tap(revertedEmail => (this.ngb.Email = revertedEmail.email))
        ).toPromise();
    }
  }

  // TODO: Send test email request
  // async sendTestEmail(element: IPerfexEmail) {
  //   console.log(element.emailtemplateid);
  // }

  ngOnInit() {
    // fromEvent(document, 'keydown').pipe(
    //   tap(event => {
    //     console.log(event);
    //   }),
    //   takeUntil(this.onDestroy$)
    // ).subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
    // this.activeLanguage$.next(null);
    this.activeLanguage$.complete();
    // this.previewTemplate$.next(null);
    this.previewTemplate$.complete();
    // this.editTemplate$.next(null);
    this.editTemplate$.complete();
    this.openSidenav$.complete();
  }
}
