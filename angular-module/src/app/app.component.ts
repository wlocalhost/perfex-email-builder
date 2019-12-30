import { Component, ElementRef, Inject } from '@angular/core';
import { ITemplate } from 'src/interfaces';
import { ResourceService } from './resource.service';
import { IpEmailBuilderService, IP_CONFIG } from 'ip-email-builder';

@Component({
  selector: 'app-root',
  template: `
    <app-templates [templates]="templates" [latest]="latest" *ngIf="mount === 'templates';else campaigns"></app-templates>
    <ng-template #campaigns>
      <app-campaigns></app-campaigns>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  mount: string;
  templates: ITemplate[];
  latest: ITemplate[];

  constructor(el: ElementRef<HTMLElement>, resourceService: ResourceService, @Inject(IP_CONFIG) config) {
    const { templates, latest = '[]', mount, apiBase, csrfToken, csrfName } = el.nativeElement.dataset;
    this.mount = mount;
    this.templates = JSON.parse(templates);
    this.latest = JSON.parse(latest);

    resourceService.init(apiBase, csrfName, csrfToken);
    config.uploadImagePath = `${apiBase}/upload`;

    console.log(config);
  }
}
