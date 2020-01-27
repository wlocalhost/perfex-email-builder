import { Component, ElementRef, Inject } from '@angular/core';
import { ITemplate } from 'src/interfaces';
import { ResourceService } from './resource.service';
import { IP_CONFIG, IForRootConf } from 'ip-email-builder';
import { AppService } from './app.service';
import { readCookie } from './utils';

@Component({
  selector: 'app-root',
  template: `
    <app-templates *ngIf="mount === 'templates';else campaigns"></app-templates>
    <ng-template #campaigns>
      <app-campaigns></app-campaigns>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      height: inherit;
      min-height: inherit;
    }
  `]
})
export class AppComponent {
  mount: string;
  latest: ITemplate[];

  constructor(
    el: ElementRef<HTMLElement>,
    resourceService: ResourceService,
    app: AppService,
    @Inject(IP_CONFIG) config: IForRootConf
  ) {
    const {
      activeLanguage, templates, languages, mount, apiBase,
      mergeFields, csrfToken, csrfName
    } = el.nativeElement.dataset;

    app.activeLanguage = activeLanguage;
    app.mergeFields = JSON.parse(mergeFields);
    app.languages = JSON.parse(languages);
    app.templatesCache.set(activeLanguage, JSON.parse(templates));

    this.mount = mount;

    resourceService.init(apiBase, csrfName, csrfToken);
    config.uploadImagePath = `${apiBase}/upload`;
    config.csrf = {
      name: csrfName,
      token: readCookie('csrf_cookie_name') || csrfToken
    };
  }
}
