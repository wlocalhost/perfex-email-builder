import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, of, Subject, fromEvent, EMPTY, from, forkJoin, combineLatest, generate } from 'rxjs';
import { tap, exhaustMap, map, takeUntil, take, catchError, finalize, switchMap, filter, delay } from 'rxjs/operators';
import { IPEmail, IpEmailBuilderService, Structure, TextBlock } from 'ip-email-builder';

import { IPreview, IPerfexEmail, IPostRespose, ISaveDetailsResponse } from '../../interfaces';
import { ResourceService } from '../resource.service';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

interface IEditTemplate {
  isEdited: boolean;
  template: IPEmail;
}
interface IEditElement {
  id: string, type: string, name: string
}

function emptyIfNull<T>() {
  return filter<T>(data => data !== null)
}

@Component({
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') private sidenav: MatSidenav

  private onDestroy$ = new Subject<boolean>();
  private activeLanguage$ = new BehaviorSubject<string>(globalThis.NGB.activeLanguage);
  private previewTemplate$ = new BehaviorSubject<IEditElement>(null);
  private editTemplateObject$ = new BehaviorSubject<IEditElement>(null);

  private updatedStore = new Map<string, Date>();
  private removeUpdatedStore = new Set<string>();

  displayedColumns = ['active', 'name', 'subject', 'actions'];

  constructor(
    public res: ResourceService,
    private ngb: IpEmailBuilderService,
    private dialog: MatDialog,
    private el: ElementRef,
  ) { }

  languages$ = this.res.getAllLanguages().pipe(
    exhaustMap(langs => this.getActiveLanguage$.pipe(
      map(activeLang => [...langs, globalThis.NGB.activeLanguage].filter(lang => lang !== activeLang).sort())
    ))
  );
  getActiveLanguage$ = this.activeLanguage$.asObservable();
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
  private getTemplateObject$ = this.editTemplateObject$.pipe(
    exhaustMap(editElementInfo => {
      if (!editElementInfo) { return of(null); }
      return forkJoin([
        this.res.getTemplate(editElementInfo.id),
        this.res.getAllMergeFields(editElementInfo.type),
      ]).pipe(
        map(([email, mergeFields]) => {
          this.ngb.MergeTags = new Set(mergeFields.map(({ key }) => key));
          return {
            ...editElementInfo,
            template: new IPEmail({
              structures: [new Structure('cols_1', [[new TextBlock(email.template.message)]])],
              ...email.template,
            })
          }
        }),
        // exhaustMap((email) => from(this.sidenav.open()).pipe(map(() => email)))
        tap(() => {
          this.previewTemplate$.next(null);
          this.sidenav.open()
        })
      )
    }),
    takeUntil(this.onDestroy$),
  );

  /**
   * Get preview template
   */
  private getPreviewTemplate$ = this.previewTemplate$.pipe(
    exhaustMap(editElementInfo => {
      if (!editElementInfo) return of(null);
      return this.res.getTemplateBody(editElementInfo.id).pipe(
        map(template => ({ ...editElementInfo, ...template })),
        tap(() => {
          this.editTemplateObject$.next(null);
          this.sidenav.open()
        })
      )
    }),
    takeUntil(this.onDestroy$),
  );

  sidenavDetails$ = combineLatest([this.getTemplateObject$, this.getPreviewTemplate$]).pipe(
    map(([editEmail, previewTemplate]) => editEmail || previewTemplate)
  )

  // All methods

  changeLanguage(lang: string) {
    this.activeLanguage$.next(lang)
  }

  editTemplate(email: IPerfexEmail, type: string) {
    this.editTemplateObject$.next({ id: email.emailtemplateid, type, name: email.name })
  }

  previewTemplate(email: IPerfexEmail, type: string) {
    this.previewTemplate$.next({ id: email.emailtemplateid, type, name: email.name })
  }

  private closeSidenav(askAboutChanges = true) {
    return of('').pipe(
      switchMap(() => {
        if (askAboutChanges && this.ngb.hasChanges) {
          return this.dialog.open(ModalDialogComponent, {
            data: { type: 'confirm' },
            width: '300px',
            maxWidth: '100%'
          }).afterClosed().pipe(map(Boolean))
        }
        return of(true)
      }),
      // finalize(() => {
      //   this.previewTemplate$.next(null);
      // }),
      exhaustMap(state => {
        if (state) {
          return from(this.sidenav.close()).pipe(
            // finalize(() => this.editTemplateObject$.next(null)),
            map(() => true)
          )
        }
        return of(false);
      })
    )
  }

  backdropClick() {
    return this.closeSidenav().pipe(take(1)).subscribe()
  }

  getUpdatedDate(element: IPerfexEmail) {
    const { emailtemplateid } = element;
    if (this.removeUpdatedStore.has(emailtemplateid)) {
      return null;
    }
    return this.updatedStore.get(emailtemplateid) || element.updated_at || null;
  }

  openBuilderFromPreview({ id, name, type }: IPreview & IEditElement) {
    return this.closeSidenav(false).pipe(take(1)).subscribe(isClosed => {
      if (isClosed) {
        this.editTemplateObject$.next({ id, name, type })
      }
    })
  }

  expansionPanelOpen(key?: string) {
    if (key) {
      localStorage.setItem('expansionPanelOpened', key);
    }
    return localStorage.getItem('expansionPanelOpened') || 'client';
  }

  saveEmail(data: IEditTemplate, closeSidenav = false) {
    const formData = new FormData();
    return this.editTemplateObject$.pipe(
      emptyIfNull(),
      exhaustMap(element => {
        formData.append('emailtemplateid', element.id);
        return this.ngb.saveEmail().pipe(
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
          finalize(() => this.updatedStore.set(element.id, new Date()))
        )
      }),
      exhaustMap(({ success }) => {
        if (success && closeSidenav) {
          return this.closeSidenav(false);
        }
        return of(success);
      }),
      take(1)
    ).subscribe(success => {
      if (success) {
        data.isEdited = true;
        this.ngb.notify('Email template has been saved successfully.');
      }
    })
  }

  changeActiveStatus({ checked, source }: MatSlideToggleChange, element: IPerfexEmail) {
    const active = checked ? 1 : 0;
    const formData = new FormData();
    formData.append('emailtemplateid', element.emailtemplateid);
    formData.append('active', String(active));
    return this.res.sendPostRequest<IPostRespose>(formData, 'changeActiveStatus')
      .pipe(
        catchError(() => {
          source.toggle();
          return EMPTY;
        }),
        take(1)
      )
      .subscribe(({ success }) => {
        if (success) {
          element.active = active;
          this.updatedStore.set(element.emailtemplateid, new Date())
        } else {
          source.toggle();
        }
      })
  }

  changeElementDetails(element: IPerfexEmail, type: string) {
    return this.res.getAllMergeFields(type).pipe(
      switchMap(mergeFields => this.dialog.open(ModalDialogComponent, {
        data: { type: 'edit', data: element, mergeFields },
        width: '450px',
        maxWidth: '100%'
      }).afterClosed()),
      exhaustMap(form => {
        if (!form) {
          return of({ success: false, updates: null });
        }
        const body = new FormData(form);
        return this.res.sendPostRequest<ISaveDetailsResponse>(body, 'updateDetails');
      })
    ).subscribe(({ success, updates }) => {
      if (success && updates) {
        element.subject = updates.subject;
        element.fromname = updates.fromname;
        this.updatedStore.set(element.emailtemplateid, new Date())
        this.ngb.notify('The details have been saved.');
      }
    })

  }

  revertTemplateBack() {
    return this.editTemplateObject$.pipe(
      emptyIfNull(),
      switchMap(({ id }) => this.dialog.open(ModalDialogComponent, {
        data: { type: 'confirm-revert' },
        width: '300px',
        maxWidth: '100%'
      }).afterClosed().pipe(
        map(Boolean),
        filter(state => state),
        exhaustMap(() => this.res.revertTemplate(id).pipe(
          finalize(() => {
            this.updatedStore.delete(id);
            this.removeUpdatedStore.add(id);
          })
        )),
      )),
      take(1),
    ).subscribe(({ email }) => {
      this.ngb.Email = email
    })
  }

  ngOnInit() {
    this.keyDowns$.subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
    this.activeLanguage$.complete();
    this.previewTemplate$.complete();
    this.editTemplateObject$.complete();
    this.updatedStore.clear();
    this.removeUpdatedStore.clear();
  }
}
