import { Component, ElementRef, Inject } from '@angular/core';
import { ITemplate, IServerTemplateResponse } from 'src/interfaces';
import { ResourceService } from './resource.service';
import { IpEmailBuilderService, IP_CONFIG } from 'ip-email-builder';

@Component({
  selector: 'app-root',
  template: `
    <app-templates
      [templates]="templates"
      [languages]="languages"
      [latest]="latest"
      *ngIf="mount === 'templates';else campaigns">
    </app-templates>
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
  templates: IServerTemplateResponse;
  latest: ITemplate[];
  languages: string[];

  constructor(el: ElementRef<HTMLElement>, resourceService: ResourceService, @Inject(IP_CONFIG) config) {
    const { templates, languages, latest = '[]', mount, apiBase, csrfToken, csrfName } = el.nativeElement.dataset;
    this.mount = mount;
    this.templates = JSON.parse(templates);
    this.latest = JSON.parse(latest);
    this.languages = JSON.parse(languages);

    resourceService.init(apiBase, csrfName, csrfToken);
    config.uploadImagePath = `${apiBase}/upload`;
  }
}
