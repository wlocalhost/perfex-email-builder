import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, of, Observable, Subject, fromEvent, EMPTY, combineLatest } from 'rxjs';
import { tap, exhaustMap, map, takeUntil, take } from 'rxjs/operators';
import { IPEmail, IpEmailBuilderService } from 'ip-email-builder';

import {
  IServerTemplateResponse,
  IPreview, IPerfexEmail, IPostRespose,
  ISaveDetailsResponse
} from '../../interfaces';
import { ResourceService } from '../resource.service';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { AppService } from '../app.service';

interface IEditTemplate extends IPerfexEmail { email?: IPEmail; isEdited?: boolean; }

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
    private dialog: MatDialog,
    private el: ElementRef
  ) { }

  displayedColumns = ['active', 'name', 'subject', 'actions'];
  activeLanguage$ = new BehaviorSubject<string>(null);
  getActiveLanguage$ = this.activeLanguage$.pipe(
    map(lang => lang || this.app.activeLanguage),
    takeUntil(this.onDestroy$),
  );
  previewTemplate$ = new BehaviorSubject<{ id: string, name: string }>(null);
  // tslint:disable-next-line: max-line-length
  editTemplate$ = new BehaviorSubject<IEditTemplate | { emailtemplateid: string, type: string, name: string, email?: IPEmail, updated_at?: string | Date }>(null);
  openSidenav$ = new Subject<boolean>();
  keyDowns$ = combineLatest([
    this.openSidenav$, fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown')
  ]).pipe(
    tap(([sidenavOpened, event]) => {
      if (sidenavOpened) {
        event.stopImmediatePropagation();
      }
      // event.stopPropagation();
      // const target = event.target as HTMLDivElement;
      // if (sidenavOpened && target.classList.contains('ql-editor')) {
      //   event.stopImmediatePropagation();
      // }
    }),
    takeUntil(this.onDestroy$)
  );

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
      return this.res.getTemplate(em.emailtemplateid).pipe(map(email => ({ ...em, ...email })));
    }),
    tap((em: IEditTemplate) => {
      if (em) {
        this.ngb.MergeTags = new Set([...this.app.mergeFields
          .filter(({ type }) => type === em.type)
          .map(({ key }) => key)
        ]);
      }
    }),
    // tap(() => this.ngb.previewTemplate.next(null)),
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
    requestAnimationFrame(() => this.editTemplate$.next({ emailtemplateid: id, type, name }));
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
        const element = this.editTemplate$.getValue();
        formData.append('emailtemplateid', element.emailtemplateid);
        formData.append('emailObject', JSON.stringify(email));
        formData.append('template', template);
        const update = await this.res.sendPostRequest<IPostRespose>(formData, 'update').toPromise();
        success = update.success;
        data.isEdited = true;
        element.updated_at = new Date();
      } catch (e) {
        success = false;
        console.error(e);
        this.ngb.notify('Something bad happened.');
      }
    }
    if (closeSidenav && success) {
      await this.closeSidenav();
    }
    if (success) {
      this.ngb.notify('Email template has been saved successfully.');
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
        element.updated_at = new Date();
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
      element.updated_at = new Date();
      this.ngb.notify('The details have been saved.');
    }
  }

  revertTemplateBack(isEdited: boolean) {
    if (!isEdited) {
      this.ngb.notify('You can\'t restore this template, as it\'s not edited.');
    } else {
      const element = this.editTemplate$.getValue();
      this.dialog.open(ModalDialogComponent, {
        data: { type: 'confirm-revert' },
        width: '300px',
        maxWidth: '100%'
      })
        .afterClosed().pipe(
          map(Boolean),
          exhaustMap(state => {
            return state && this.res.revertTemplate(element.emailtemplateid) || EMPTY;
          }),
          // tap(email => requestAnimationFrame(() => this.openSidenav$.next(!!email))),
          tap(revertedEmail => (this.ngb.Email = revertedEmail.email)),
          tap(() => delete element.updated_at),
          take(1),
        ).toPromise();
    }
  }

  ngOnInit() {
    this.keyDowns$.subscribe();
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
