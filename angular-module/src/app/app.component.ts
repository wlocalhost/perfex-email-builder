import { Component, ElementRef, Inject, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild, TemplateRef } from '@angular/core';
import { IP_CONFIG, IForRootConf } from 'ip-email-builder';

import { ResourceService } from './resource.service';
import { AppService } from './app.service';
import { readCookie } from './utils';

@Component({
  selector: 'app-root',
  template: `
    <ng-template></ng-template>
  `,
  styles: [`
    :host {
      display: block;
      height: inherit;
      min-height: inherit;
    }
  `],
})
export class AppComponent implements OnInit {
  @ViewChild(TemplateRef, { read: ViewContainerRef })
  private templateRef: ViewContainerRef;

  constructor(
    private el: ElementRef<HTMLElement>,
    private resourceService: ResourceService,
    private app: AppService,
    @Inject(IP_CONFIG) private config: IForRootConf,
    private componentFactory: ComponentFactoryResolver,
  ) { }

  async ngOnInit() {
    const {
      activeLanguage, languages, mount, apiBase,
      mergeFields, csrfToken, csrfName
    } = this.el.nativeElement.dataset;

    this.app.activeLanguage = activeLanguage;
    this.app.mergeFields = JSON.parse(mergeFields);
    this.app.languages = JSON.parse(languages);

    this.resourceService.init(apiBase, csrfName, csrfToken);
    this.config.uploadImagePath = `${apiBase}/upload`;
    this.config.csrf = { name: csrfName, token: readCookie('csrf_cookie_name') || csrfToken };
    await this.lazyLoadComponent(mount)
  }

  async lazyLoadComponent(mount?: string) {
    let component: any;
    if (mount === 'campaigns') {
      const { CampaignsComponent } = await import('./campaigns/campaigns.component');
      component = this.componentFactory.resolveComponentFactory(CampaignsComponent);
    } else {
      const { TemplatesComponent } = await import('./templates/templates.component');
      component = this.componentFactory.resolveComponentFactory(TemplatesComponent);
    }
    this.templateRef.clear();
    this.templateRef.createComponent(component);
  }
}
