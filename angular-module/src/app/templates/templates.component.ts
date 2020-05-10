import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, of, Subject, fromEvent, EMPTY, from } from 'rxjs';
import { tap, exhaustMap, map, takeUntil, take, catchError, finalize } from 'rxjs/operators';
import { IPEmail, IpEmailBuilderService } from 'ip-email-builder';

import { IPreview, IPerfexEmail, IPostRespose, ISaveDetailsResponse } from '../../interfaces';
import { ResourceService } from '../resource.service';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

interface IEditTemplate extends IPerfexEmail { email?: IPEmail; isEdited?: boolean; }
interface IDontKnow {
  emailtemplateid: string,
  type: string,
  name: string,
  email?: IPEmail,
  updated_at?: string | Date
}

@Component({
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') private sidenav: MatSidenav

  private onDestroy$ = new Subject<boolean>();
  private activeLanguage$ = new BehaviorSubject<string>(null);
  private previewTemplate$ = new BehaviorSubject<{ id: string, name: string }>(null);
  private editTemplateObject$ = new BehaviorSubject<IEditTemplate | IDontKnow>(null);

  displayedColumns = ['active', 'name', 'subject', 'actions'];

  constructor(
    public res: ResourceService,
    private ngb: IpEmailBuilderService,
    private dialog: MatDialog,
    private el: ElementRef,
  ) { }

  languages$ = this.res.getAllLanguages().pipe(
    exhaustMap(langs => this.getActiveLanguage$.pipe(
      map(activeLang => langs.filter(lang => ![activeLang].includes(lang)))
    )),
    takeUntil(this.onDestroy$)
  );
  getActiveLanguage$ = this.activeLanguage$.pipe(
    map(lang => lang || globalThis.NGB.activeLanguage),
    takeUntil(this.onDestroy$),
  );
  keyDowns$ = fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown').pipe(
    tap((event) => {
      if (this.sidenav.opened) {
        event.stopImmediatePropagation();
      }
    }),
    takeUntil(this.onDestroy$)
  );

  /**
   * Get all templates by active language
   */
  getTemplates$ = this.getActiveLanguage$.pipe(
    exhaustMap(lang => this.res.getTemplatesByLang(lang)),
    takeUntil(this.onDestroy$),
  );

  /**
   * Open sidenav to edit current email
   */
  getTemplateObject$ = this.editTemplateObject$.pipe(
    exhaustMap(em => {
      if (!em) { return of(null); }
      if (em.email) { return of(em); }
      return this.res.getTemplate(em.emailtemplateid).pipe(map(email => ({ ...em, ...email })));
    }),
    exhaustMap(email => {
      if (!email) { return of(null); }
      return this.res.getAllMergeFields(email.type).pipe(
        tap(mergeFields => {
          this.ngb.MergeTags = new Set(mergeFields.map(({ key }) => key));
        }),
        map(() => email),
        tap(() => {
          this.previewTemplate$.next(null);
          this.sidenav.open()
        })
      )
    }),
    takeUntil(this.onDestroy$),
  );

  getPreviewTemplate$ = this.previewTemplate$.pipe(
    exhaustMap(em => em && this.res.getTemplateBody(em.id).pipe(
      map(data => ({ ...data, ...em })),
      tap(data => {
        if (data) {
          this.editTemplateObject$.next(null);
          this.sidenav.open()
        }
      })
    ) || of(null)),
    takeUntil(this.onDestroy$),
  );

  changeLanguage(lang: string) {
    this.activeLanguage$.next(lang)
  }

  editTemplate(email: IPerfexEmail, type: string) {
    this.editTemplateObject$.next({ emailtemplateid: email.emailtemplateid, type, name: email.name })
  }

  previewTemplate(email: IPerfexEmail) {
    this.previewTemplate$.next({
      id: email.emailtemplateid,
      name: email.name
    })
  }

  async closeSidenav(askAboutChanges = true) {
    let closeState = true;
    if (askAboutChanges && this.ngb.hasChanges && this.editTemplateObject$.getValue()) {
      closeState = await this.dialog.open(ModalDialogComponent, {
        data: { type: 'confirm' },
        width: '300px',
        maxWidth: '100%'
      })
        .afterClosed().pipe(map(Boolean)).toPromise();
    }
    if (closeState) {
      await this.sidenav.close()
      this.editTemplateObject$.next(null);
    }
    this.previewTemplate$.next(null);
  }

  async openBuilderFromPreview({ id, type, name }: IPreview) {
    this.previewTemplate$.next(null);
    await this.closeSidenav()
    this.editTemplateObject$.next({ emailtemplateid: id, type, name })
  }

  expansionPanelOpen(key?: string) {
    if (key) {
      localStorage.setItem('expansionPanelOpened', key);
    }
    return localStorage.getItem('expansionPanelOpened') || 'client';
  }

  async saveEmail(data: IEditTemplate, closeSidenav = false) {
    // let success = true;
    if (this.ngb.hasChanges) {
      const formData = new FormData();
      const element = this.editTemplateObject$.getValue();
      formData.append('emailtemplateid', element.emailtemplateid);
      this.ngb.saveEmail().pipe(
        exhaustMap(({ html }) => {
          formData.append('emailObject', JSON.stringify(this.ngb.Email));
          formData.append('template', html);
          return this.res.sendPostRequest<IPostRespose>(formData, 'update')
        }),
        catchError((error) => {
          console.error(error);
          this.ngb.notify('Something bad happened.');
          return EMPTY;
        }),
        take(1)
      ).subscribe(({ success }) => {
        if (success) {
          data.isEdited = true;
          element.updated_at = new Date();
          if (closeSidenav) {
            from(this.closeSidenav()).pipe(finalize(() => this.ngb.notify('Email template has been saved successfully.')))
          } else {
            this.ngb.notify('Email template has been saved successfully.');
          }
        }
      })
    } else {
      if (closeSidenav) {
        await this.closeSidenav();
      }
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

  async changeElementDetails(element: IPerfexEmail) {
    const res: ISaveDetailsResponse = await this.dialog.open(ModalDialogComponent, {
      data: {
        type: 'edit',
        data: element,
        mergeFields: []// this.app.mergeFields.filter(_ => type === _.type)
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
      const element = this.editTemplateObject$.getValue();
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
    this.editTemplateObject$.complete();
  }
}
